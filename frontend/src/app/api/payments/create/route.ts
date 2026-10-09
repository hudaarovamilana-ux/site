import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPaidPlanId, PAID_PLANS } from "@/lib/premium";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { buildRobokassaUrl, isRobokassaConfigured } from "@/lib/robokassa";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isRobokassaConfigured()) {
      return NextResponse.json(
        { error: "Оплата временно недоступна. Попробуйте позже." },
        { status: 503 }
      );
    }

    const session = await requireSession();
    const ip = getClientIp(request);
    const limit = await rateLimit(`pay-create:${session.userId}:${ip}`, 20, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Слишком много попыток оплаты. Попробуйте позже.", retryAfterSec: limit.retryAfterSec },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { planId?: string };
    const planId = body.planId?.trim() ?? "";
    if (!isPaidPlanId(planId)) {
      return NextResponse.json({ error: "Неизвестный тариф" }, { status: 400 });
    }

    const plan = PAID_PLANS[planId];
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amountValue: plan.amountValue,
        currency: "RUB",
        status: "pending",
      },
    });

    const confirmationUrl = buildRobokassaUrl({
      invoiceNumber: payment.invoiceNumber,
      amountValue: plan.amountValue,
      description: plan.description,
      email: user.email,
      paymentId: payment.id,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { confirmationUrl, status: "pending" },
    });

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      confirmationUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/payments/create]", error);
    const message =
      error instanceof Error ? error.message : "Не удалось создать платёж";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
