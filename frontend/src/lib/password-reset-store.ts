import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/db";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const SEND_WINDOW_MS = 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashCode(email: string, code: string): string {
  return createHash("sha256")
    .update(`reset:${email}:${code}:${process.env.VERIFICATION_SECRET ?? "zk-dev"}`)
    .digest("hex");
}

export function generateResetCode(): string {
  return String(randomInt(100000, 999999));
}

export async function canSendResetCode(
  email: string
): Promise<{ ok: true } | { ok: false; reason: string; retryAfterSec?: number }> {
  const key = normalizeEmail(email);
  const existing = await prisma.passwordReset.findUnique({ where: { email: key } });
  if (!existing) return { ok: true };

  const now = Date.now();
  const sinceLast = now - existing.lastSentAt.getTime();
  if (sinceLast < RESEND_COOLDOWN_MS) {
    return {
      ok: false,
      reason: "Подождите перед повторной отправкой",
      retryAfterSec: Math.ceil((RESEND_COOLDOWN_MS - sinceLast) / 1000),
    };
  }

  if (now - existing.sendWindowStart.getTime() > SEND_WINDOW_MS) {
    return { ok: true };
  }

  if (existing.sendCount >= MAX_SENDS_PER_HOUR) {
    return { ok: false, reason: "Слишком много запросов. Попробуйте через час." };
  }

  return { ok: true };
}

export async function saveResetCode(email: string, code: string): Promise<void> {
  const key = normalizeEmail(email);
  const now = new Date();
  const existing = await prisma.passwordReset.findUnique({ where: { email: key } });
  const sameWindow =
    existing && now.getTime() - existing.sendWindowStart.getTime() <= SEND_WINDOW_MS;

  await prisma.passwordReset.upsert({
    where: { email: key },
    create: {
      email: key,
      codeHash: hashCode(key, code),
      expiresAt: new Date(now.getTime() + CODE_TTL_MS),
      attempts: 0,
      lastSentAt: now,
      sendCount: 1,
      sendWindowStart: now,
    },
    update: {
      codeHash: hashCode(key, code),
      expiresAt: new Date(now.getTime() + CODE_TTL_MS),
      attempts: 0,
      lastSentAt: now,
      sendCount: sameWindow ? (existing?.sendCount ?? 0) + 1 : 1,
      sendWindowStart: sameWindow ? existing.sendWindowStart : now,
    },
  });
}

export async function verifyResetCode(
  email: string,
  code: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const key = normalizeEmail(email);
  const entry = await prisma.passwordReset.findUnique({ where: { email: key } });

  if (!entry) {
    return { ok: false, reason: "Код не найден. Запросите новый." };
  }

  if (Date.now() > entry.expiresAt.getTime()) {
    await prisma.passwordReset.deleteMany({ where: { email: key } });
    return { ok: false, reason: "Код истёк. Запросите новый." };
  }

  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    await prisma.passwordReset.deleteMany({ where: { email: key } });
    return { ok: false, reason: "Превышено число попыток. Запросите новый код." };
  }

  if (hashCode(key, code.trim()) !== entry.codeHash) {
    await prisma.passwordReset.update({
      where: { email: key },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "Неверный код. Проверьте письмо и попробуйте снова." };
  }

  await prisma.passwordReset.delete({ where: { email: key } });
  return { ok: true };
}
