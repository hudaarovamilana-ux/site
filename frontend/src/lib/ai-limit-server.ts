import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AI_LIMITS } from "@/lib/ai-limits";

function limitResponse(error: string) {
  return NextResponse.json({ error, remaining: 0 }, { status: 429 });
}

export async function reserveAsk(
  userId: string
): Promise<{ ok: true; used: number } | { ok: false; response: NextResponse }> {
  const updated = await prisma.user.updateMany({
    where: { id: userId, aiAskUsed: { lt: AI_LIMITS.ask } },
    data: { aiAskUsed: { increment: 1 } },
  });
  if (updated.count === 0) {
    return {
      ok: false,
      response: limitResponse(
        `Достигнут лимит вопросов (${AI_LIMITS.ask}). Оформите подписку для большего числа запросов.`
      ),
    };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiAskUsed: true },
  });
  return { ok: true, used: user?.aiAskUsed ?? 1 };
}

export async function releaseAsk(userId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { id: userId, aiAskUsed: { gt: 0 } },
    data: { aiAskUsed: { decrement: 1 } },
  });
}

export async function reserveTrust(
  userId: string
): Promise<{ ok: true; used: number } | { ok: false; response: NextResponse }> {
  const updated = await prisma.user.updateMany({
    where: { id: userId, aiTrustUsed: { lt: AI_LIMITS.trustChat } },
    data: { aiTrustUsed: { increment: 1 } },
  });
  if (updated.count === 0) {
    return {
      ok: false,
      response: limitResponse(`Достигнут лимит сообщений в чате доверия (${AI_LIMITS.trustChat}).`),
    };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiTrustUsed: true },
  });
  return { ok: true, used: user?.aiTrustUsed ?? 1 };
}

export async function releaseTrust(userId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { id: userId, aiTrustUsed: { gt: 0 } },
    data: { aiTrustUsed: { decrement: 1 } },
  });
}

export async function reserveHealth(
  userId: string
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const updated = await prisma.user.updateMany({
    where: { id: userId, aiHealthUsed: false },
    data: { aiHealthUsed: true },
  });
  if (updated.count === 0) {
    return {
      ok: false,
      response: limitResponse(
        `Бесплатная оценка уже использована (лимит: ${AI_LIMITS.healthAssessment} раз). Оформите подписку для повторной оценки.`
      ),
    };
  }
  return { ok: true };
}

export async function releaseHealth(userId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { id: userId, aiHealthUsed: true },
    data: { aiHealthUsed: false },
  });
}

export async function getAiUsageCounts(userId: string): Promise<{
  healthUsed: boolean;
  askUsed: number;
  trustUsed: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiAskUsed: true, aiTrustUsed: true, aiHealthUsed: true },
  });
  return {
    healthUsed: user?.aiHealthUsed ?? false,
    askUsed: user?.aiAskUsed ?? 0,
    trustUsed: user?.aiTrustUsed ?? 0,
  };
}
