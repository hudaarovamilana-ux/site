import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensurePaymentReceipt } from "@/lib/payment-receipt";
import { grantPremiumAccess, isPaidPlanId, isPremiumActive } from "@/lib/premium";
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
          payment.paidAt = new Date();
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

    const fresh = await prisma.payment.findUnique({
      where: { id: payment.id },
      select: { status: true, receiptEmailSentAt: true },
    });

    if (fresh?.status === "succeeded" && !fresh.receiptEmailSentAt) {
      try {
        await ensurePaymentReceipt(payment.id);
      } catch (error) {
        console.error("[api/payments/id] receipt", error);
      }
    }

    const afterReceipt = await prisma.payment.findUnique({
      where: { id: payment.id },
      select: { receiptEmailSentAt: true },
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
        paidAt: payment.paidAt,
        receiptSent: Boolean(afterReceipt?.receiptEmailSentAt),
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
