import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { grantPremiumAccess, isPaidPlanId, isPremiumActive } from "@/lib/premium";
import { isRobokassaConfigured, refreshRobokassaPayment } from "@/lib/robokassa";
import { getYooKassaPayment, isYooKassaConfigured } from "@/lib/yookassa";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.userId !== session.userId) {
      return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
    }

    if (payment.status !== "succeeded" && payment.yookassaId && isYooKassaConfigured()) {
      try {
        const remote = await getYooKassaPayment(payment.yookassaId);
        if ((remote.status === "succeeded" || remote.paid) && isPaidPlanId(payment.planId)) {
          await grantPremiumAccess({
            userId: payment.userId,
            planId: payment.planId,
            paymentId: payment.id,
          });
          payment.status = "succeeded";
        } else if (remote.status === "canceled") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "canceled" },
          });
          payment.status = "canceled";
        }
      } catch (error) {
        console.error("[api/payments/id] sync", error);
      }
    }

    if (
      payment.status !== "succeeded" &&
      !payment.yookassaId &&
      payment.invoiceNumber &&
      isRobokassaConfigured()
    ) {
      try {
        await refreshRobokassaPayment(payment.invoiceNumber);
      } catch (error) {
        console.error("[api/payments/id] robokassa", error);
      }
    }

    const fresh = await prisma.payment.findUnique({
      where: { id: payment.id },
      select: { status: true, paidAt: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { premiumUntil: true, premiumPlan: true },
    });

    return NextResponse.json({
      ok: true,
      payment: {
        id: payment.id,
        planId: payment.planId,
        status: fresh?.status ?? payment.status,
        amountValue: payment.amountValue,
        paidAt: fresh?.paidAt ?? payment.paidAt,
      },
      premium: {
        active: isPremiumActive(user?.premiumUntil),
        until: user?.premiumUntil ?? null,
        plan: user?.premiumPlan ?? null,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/payments/id]", error);
    return NextResponse.json({ error: "Не удалось получить статус платежа" }, { status: 500 });
  }
}
