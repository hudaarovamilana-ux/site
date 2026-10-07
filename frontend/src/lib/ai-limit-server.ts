import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AI_LIMITS, AI_PREMIUM_LIMITS } from "@/lib/ai-limits";
import { isPremiumActive } from "@/lib/premium";

function limitResponse(error: string) {
  return NextResponse.json({ error, remaining: 0 }, { status: 429 });
}

async function getUserLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      aiAskUsed: true,
      aiTrustUsed: true,
      aiHealthUsed: true,
      premiumUntil: true,
    },
  });
  const premium = isPremiumActive(user?.premiumUntil);
  return {
    premium,
    askUsed: user?.aiAskUsed ?? 0,
    trustUsed: user?.aiTrustUsed ?? 0,
    healthUsed: user?.aiHealthUsed ?? false,
    askLimit: premium ? AI_PREMIUM_LIMITS.ask : AI_LIMITS.ask,
    trustLimit: premium ? AI_PREMIUM_LIMITS.trustChat : AI_LIMITS.trustChat,
    healthLimit: premium ? AI_PREMIUM_LIMITS.healthAssessment : AI_LIMITS.healthAssessment,
  };
}

export async function reserveAsk(
  userId: string
): Promise<{ ok: true; used: number } | { ok: false; response: NextResponse }> {
  const limits = await getUserLimits(userId);
  const updated = await prisma.user.updateMany({
    where: { id: userId, aiAskUsed: { lt: limits.askLimit } },
    data: { aiAskUsed: { increment: 1 } },
  });
  if (updated.count === 0) {
    return {
      ok: false,
      response: limitResponse(
        `Достигнут лимит вопросов (${limits.askLimit}).${
          limits.premium ? "" : " Оформите подписку для большего числа запросов."
        }`
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
  const limits = await getUserLimits(userId);
  const updated = await prisma.user.updateMany({
    where: { id: userId, aiTrustUsed: { lt: limits.trustLimit } },
    data: { aiTrustUsed: { increment: 1 } },
  });
  if (updated.count === 0) {
    return {
      ok: false,
      response: limitResponse(
        `Достигнут лимит сообщений в чате доверия (${limits.trustLimit}).`
      ),
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
  const limits = await getUserLimits(userId);

  if (limits.premium) {
    // Для премиума разрешаем повторные оценки: сбрасываем флаг при каждом старте.
    await prisma.user.update({
      where: { id: userId },
      data: { aiHealthUsed: true },
    });
    return { ok: true };
  }

  const updated = await prisma.user.updateMany({
    where: { id: userId, aiHealthUsed: false },
    data: { aiHealthUsed: true },
  });
  if (updated.count === 0) {
    return {
      ok: false,
      response: limitResponse(
        `Бесплатная оценка уже использована (лимит: ${limits.healthLimit} раз). Оформите подписку для повторной оценки.`
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
  premium: boolean;
  askLimit: number;
  trustLimit: number;
}> {
  const limits = await getUserLimits(userId);
  return {
    healthUsed: limits.healthUsed,
    askUsed: limits.askUsed,
    trustUsed: limits.trustUsed,
    premium: limits.premium,
    askLimit: limits.askLimit,
    trustLimit: limits.trustLimit,
  };
}
