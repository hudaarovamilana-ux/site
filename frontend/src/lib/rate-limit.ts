import { prisma } from "@/lib/db";

type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

/**
 * Лимит в PostgreSQL. Счётчик общий для всех процессов и переживает redeploy.
 * Если база недоступна, запрос не блокируем — иначе вход ляжет вместе с лимитером.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
      VALUES (
        ${key},
        1,
        NOW() + (${windowMs} * INTERVAL '1 millisecond'),
        NOW()
      )
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
          ELSE "RateLimitBucket"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimitBucket"."resetAt" <= NOW() THEN NOW() + (${windowMs} * INTERVAL '1 millisecond')
          ELSE "RateLimitBucket"."resetAt"
        END,
        "updatedAt" = NOW()
      WHERE "RateLimitBucket"."resetAt" <= NOW() OR "RateLimitBucket"."count" < ${limit}
      RETURNING "count", "resetAt"
    `;

    if (rows.length > 0) return { ok: true };

    const existing = await prisma.rateLimitBucket.findUnique({
      where: { key },
      select: { resetAt: true },
    });
    const retryAfterSec = existing
      ? Math.max(1, Math.ceil((existing.resetAt.getTime() - Date.now()) / 1000))
      : 60;
    return { ok: false, retryAfterSec };
  } catch (error) {
    console.error("[rate-limit]", error);
    return { ok: true };
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
