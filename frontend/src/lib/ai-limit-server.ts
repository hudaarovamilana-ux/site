import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AI_COOKIE, AI_LIMITS } from "@/lib/ai-limits";

const ONE_YEAR = 60 * 60 * 24 * 365;

function parseCount(value: string | undefined): number {
  const n = parseInt(value ?? "0", 10);
  return Number.isNaN(n) ? 0 : n;
}

function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: ONE_YEAR,
    path: "/",
  };
}

export async function checkHealthLimit(): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const store = await cookies();
  if (store.get(AI_COOKIE.healthUsed)?.value === "1") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: `Бесплатная оценка уже использована (лимит: ${AI_LIMITS.healthAssessment} раз). Оформите подписку для повторной оценки.`,
        },
        { status: 429 }
      ),
    };
  }
  return { ok: true };
}

export function markHealthUsed(response: NextResponse): NextResponse {
  response.cookies.set(AI_COOKIE.healthUsed, "1", cookieOpts());
  return response;
}

export async function checkAskLimit(): Promise<
  { ok: true; used: number } | { ok: false; response: NextResponse }
> {
  const store = await cookies();
  const used = parseCount(store.get(AI_COOKIE.askCount)?.value);
  if (used >= AI_LIMITS.ask) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: `Достигнут лимит вопросов (${AI_LIMITS.ask}). Оформите подписку для большего числа запросов.`,
          remaining: 0,
        },
        { status: 429 }
      ),
    };
  }
  return { ok: true, used };
}

export function incrementAskCount(response: NextResponse, used: number): NextResponse {
  const next = used + 1;
  response.cookies.set(AI_COOKIE.askCount, String(next), cookieOpts());
  return response;
}

export async function checkTrustLimit(): Promise<
  { ok: true; used: number } | { ok: false; response: NextResponse }
> {
  const store = await cookies();
  const used = parseCount(store.get(AI_COOKIE.trustCount)?.value);
  if (used >= AI_LIMITS.trustChat) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: `Достигнут лимит сообщений в чате доверия (${AI_LIMITS.trustChat}).`,
          remaining: 0,
        },
        { status: 429 }
      ),
    };
  }
  return { ok: true, used };
}

export function incrementTrustCount(response: NextResponse, used: number): NextResponse {
  const next = used + 1;
  response.cookies.set(AI_COOKIE.trustCount, String(next), cookieOpts());
  return response;
}

export async function getAiUsageCounts(): Promise<{
  healthUsed: boolean;
  askUsed: number;
  trustUsed: number;
}> {
  const store = await cookies();
  return {
    healthUsed: store.get(AI_COOKIE.healthUsed)?.value === "1",
    askUsed: parseCount(store.get(AI_COOKIE.askCount)?.value),
    trustUsed: parseCount(store.get(AI_COOKIE.trustCount)?.value),
  };
}
