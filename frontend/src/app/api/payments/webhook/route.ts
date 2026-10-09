import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMoyNalogConfigured } from "@/lib/moy-nalog";
import { ensurePaymentReceipt } from "@/lib/payment-receipt";
import { grantPremiumAccess, isPaidPlanId } from "@/lib/premium";
import { getYooKassaPayment, isYooKassaConfigured } from "@/lib/yookassa";

export const runtime = "nodejs";

type NotificationBody = {
  event?: string;
  object?: {
    id?: string;
    status?: string;
    paid?: boolean;
    metadata?: Record<string, string>;
  };
};

export async function POST(request: Request) {
  try {
    if (!isYooKassaConfigured()) {
      return NextResponse.json({ error: "YooKassa not configured" }, { status: 503 });
    }

    const body = (await request.json()) as NotificationBody;
    const yookassaId = body.object?.id?.trim();
    if (!yookassaId) {
      return NextResponse.json({ error: "Missing payment id" }, { status: 400 });
    }

    // Подтверждаем статус у ЮKassa, а не доверяем телу уведомления.
    const remote = await getYooKassaPayment(yookassaId);
    if (remote.status !== "succeeded" && !remote.paid) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const payment =
      (await prisma.payment.findUnique({ where: { yookassaId } })) ??
      (remote.metadata?.paymentId
        ? await prisma.payment.findUnique({ where: { id: remote.metadata.paymentId } })
        : null);

    if (!payment) {
      console.error("[api/payments/webhook] payment not found", yookassaId);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "succeeded" && payment.receiptEmailSentAt) {
      return NextResponse.json({ ok: true, already: true });
    }

    const metaPlan = remote.metadata?.planId ?? "";
    const planId = isPaidPlanId(payment.planId)
      ? payment.planId
      : isPaidPlanId(metaPlan)
        ? metaPlan
        : null;

    if (!planId) {
      console.error("[api/payments/webhook] bad plan", payment.id);
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    if (!payment.yookassaId) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { yookassaId },
      });
    }

    if (payment.status !== "succeeded") {
      await grantPremiumAccess({
        userId: payment.userId,
        planId,
        paymentId: payment.id,
      });
    }

    try {
      await ensurePaymentReceipt(payment.id);
    } catch (error) {
      console.error("[api/payments/webhook] receipt", error);
      if (isMoyNalogConfigured()) {
        return NextResponse.json({ error: "Receipt failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/payments/webhook]", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
