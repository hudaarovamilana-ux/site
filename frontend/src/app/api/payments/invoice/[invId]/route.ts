import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPremiumActive } from "@/lib/premium";
import { isRobokassaConfigured, refreshRobokassaPayment } from "@/lib/robokassa";

export const runtime = "nodejs";

type Params = { params: Promise<{ invId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { invId } = await params;
    const invoiceNumber = Number(invId);
    if (!Number.isInteger(invoiceNumber) || invoiceNumber <= 0) {
      return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
    }

    const payment = await prisma.payment.findUnique({ where: { invoiceNumber } });
    if (!payment || payment.userId !== session.userId) {
      return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
    }

    if (payment.status !== "succeeded" && isRobokassaConfigured()) {
      try {
        await refreshRobokassaPayment(invoiceNumber);
      } catch (error) {
        console.error("[api/payments/invoice] robokassa", error);
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
    console.error("[api/payments/invoice]", error);
    return NextResponse.json({ error: "Не удалось получить статус платежа" }, { status: 500 });
  }
}
