import { PRICE_MONTHLY, PRICE_PREGNANCY } from "@/lib/pricing";
import { prisma } from "@/lib/db";

export type PaidPlanId = "premium_month" | "premium_pregnancy";

export type PaidPlan = {
  id: PaidPlanId;
  title: string;
  amountValue: string;
  amountRub: number;
  days: number;
  description: string;
};

export const PAID_PLANS: Record<PaidPlanId, PaidPlan> = {
  premium_month: {
    id: "premium_month",
    title: "Премиум на 30 дней",
    amountValue: `${PRICE_MONTHLY}.00`,
    amountRub: PRICE_MONTHLY,
    days: 30,
    description: "Доступ к сервису «Женская консультация» на 30 дней",
  },
  premium_pregnancy: {
    id: "premium_pregnancy",
    title: "Премиум на 270 дней",
    amountValue: `${PRICE_PREGNANCY}.00`,
    amountRub: PRICE_PREGNANCY,
    days: 270,
    description: "Доступ к сервису «Женская консультация» на 270 дней",
  },
};

export function isPaidPlanId(value: string): value is PaidPlanId {
  return value === "premium_month" || value === "premium_pregnancy";
}

export function isPremiumActive(premiumUntil: Date | null | undefined): boolean {
  if (!premiumUntil) return false;
  return premiumUntil.getTime() > Date.now();
}

export function addPremiumDays(from: Date, days: number): Date {
  const result = new Date(from);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export async function grantPremiumAccess(input: {
  userId: string;
  planId: PaidPlanId;
  paymentId: string;
}): Promise<Date> {
  const plan = PAID_PLANS[input.planId];
  const existing = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    select: { status: true, userId: true },
  });
  if (!existing || existing.userId !== input.userId) {
    throw new Error("Платёж не найден");
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { premiumUntil: true },
  });
  if (!user) {
    throw new Error("Пользователь не найден");
  }

  if (existing.status === "succeeded") {
    return user.premiumUntil ?? new Date();
  }

  const now = new Date();
  const base =
    user.premiumUntil && user.premiumUntil.getTime() > now.getTime()
      ? user.premiumUntil
      : now;
  const premiumUntil = addPremiumDays(base, plan.days);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: input.userId },
      data: {
        premiumUntil,
        premiumPlan: input.planId,
      },
    }),
    prisma.payment.update({
      where: { id: input.paymentId },
      data: {
        status: "succeeded",
        paidAt: now,
      },
    }),
  ]);

  return premiumUntil;
}
