import { prisma } from "@/lib/db";
import { sendReceiptEmail } from "@/lib/email";
import {
  createIncomeReceipt,
  isMoyNalogConfigured,
  sendOfficialReceiptEmail,
} from "@/lib/moy-nalog";
import { isPaidPlanId, PAID_PLANS } from "@/lib/premium";

const CLAIM_MS = 90_000;

export async function ensurePaymentReceipt(paymentId: string): Promise<void> {
  if (!isMoyNalogConfigured()) {
    console.warn("[receipt] Мой налог не настроен, чек пропущен");
    return;
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!payment || payment.status !== "succeeded") return;
  if (payment.receiptEmailSentAt) return;

  let receiptUuid = payment.receiptUuid;
  let receiptUrl = payment.receiptUrl;

  if (!receiptUuid) {
    const claimed = await prisma.payment.updateMany({
      where: {
        id: payment.id,
        receiptUuid: null,
        OR: [
          { receiptClaimedAt: null },
          { receiptClaimedAt: { lt: new Date(Date.now() - CLAIM_MS) } },
        ],
      },
      data: { receiptClaimedAt: new Date(), receiptError: null },
    });

    if (claimed.count === 0) return;

    try {
      const plan = isPaidPlanId(payment.planId) ? PAID_PLANS[payment.planId] : null;
      const created = await createIncomeReceipt({
        name: plan?.description ?? "Доступ к сервису «Женская консультация»",
        amount: Number(payment.amountValue),
        clientName: payment.user.name,
      });
      receiptUuid = created.receiptUuid;
      receiptUrl = created.receiptUrl;
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          receiptUuid,
          receiptUrl,
          receiptClaimedAt: null,
          receiptError: null,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось создать чек";
      await prisma.payment.update({
        where: { id: payment.id },
        data: { receiptClaimedAt: null, receiptError: message.slice(0, 500) },
      });
      throw error;
    }
  }

  if (!receiptUuid || !receiptUrl || !payment.user.email) return;

  const official = await sendOfficialReceiptEmail(receiptUuid, payment.user.email);
  if (!official) {
    await sendReceiptEmail({
      to: payment.user.email,
      amount: String(Number(payment.amountValue)),
      serviceName: isPaidPlanId(payment.planId)
        ? PAID_PLANS[payment.planId].description
        : "Доступ к сервису «Женская консультация»",
      receiptUrl,
    });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { receiptEmailSentAt: new Date(), receiptError: null },
  });
}
