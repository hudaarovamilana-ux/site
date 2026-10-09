import { createHash } from "crypto";
import { grantPremiumAccess, isPaidPlanId } from "@/lib/premium";
import { prisma } from "@/lib/db";

const PAY_URL = "https://auth.robokassa.ru/Merchant/Index.aspx";
const STATE_URL = "https://auth.robokassa.ru/Merchant/WebService/Service.asmx/OpStateExt";

function merchantLogin(): string {
  return process.env.ROBOKASSA_MERCHANT_LOGIN?.trim() ?? "";
}

function password1(): string {
  return process.env.ROBOKASSA_PASSWORD_1?.trim() ?? "";
}

function password2(): string {
  return process.env.ROBOKASSA_PASSWORD_2?.trim() ?? "";
}

export function isRobokassaConfigured(): boolean {
  return Boolean(merchantLogin() && password1() && password2());
}

export function robokassaSign(parts: Array<string | number>): string {
  return createHash("md5").update(parts.join(":"), "utf8").digest("hex");
}

export function buildRobokassaUrl(input: {
  invoiceNumber: number;
  amountValue: string;
  description: string;
  email: string;
  paymentId: string;
}): string {
  const login = merchantLogin();
  const shp = `Shp_payment=${input.paymentId}`;
  const signature = robokassaSign([
    login,
    input.amountValue,
    input.invoiceNumber,
    password1(),
    shp,
  ]);

  const params = new URLSearchParams({
    MerchantLogin: login,
    OutSum: input.amountValue,
    InvId: String(input.invoiceNumber),
    Description: input.description.slice(0, 100),
    SignatureValue: signature,
    Culture: "ru",
    Email: input.email,
    Shp_payment: input.paymentId,
  });

  if (process.env.ROBOKASSA_TEST === "1") {
    params.set("IsTest", "1");
  }

  return `${PAY_URL}?${params.toString()}`;
}

export function isValidResultSignature(input: {
  outSum: string;
  invoiceNumber: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = robokassaSign([
    input.outSum,
    input.invoiceNumber,
    password2(),
    `Shp_payment=${input.paymentId}`,
  ]);
  return expected.toLowerCase() === input.signature.trim().toLowerCase();
}

export async function markRobokassaPaid(invoiceNumber: number): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { invoiceNumber } });
  if (!payment || payment.status === "succeeded") return;
  if (!isPaidPlanId(payment.planId)) {
    throw new Error("Неизвестный тариф в счёте Robokassa");
  }
  await grantPremiumAccess({
    userId: payment.userId,
    planId: payment.planId,
    paymentId: payment.id,
  });
}

export async function refreshRobokassaPayment(invoiceNumber: number): Promise<void> {
  if (!isRobokassaConfigured()) return;
  const payment = await prisma.payment.findUnique({ where: { invoiceNumber } });
  if (!payment || payment.status === "succeeded") return;

  const signature = robokassaSign([merchantLogin(), invoiceNumber, password2()]);
  const url = `${STATE_URL}?MerchantLogin=${encodeURIComponent(merchantLogin())}&InvoiceID=${invoiceNumber}&Signature=${signature}`;
  const res = await fetch(url, { cache: "no-store" });
  const xml = await res.text();
  const codes = [...xml.matchAll(/<Code>\s*(\d+)\s*<\/Code>/g)].map((match) => match[1]);
  if (codes[0] !== "0" || codes[1] !== "100") return;

  const outSum = xml.match(/<OutSum>\s*([^<]+)\s*<\/OutSum>/)?.[1]?.trim() ?? "";
  const paidAmount = Number(outSum);
  const expectedAmount = Number(payment.amountValue);
  if (
    !outSum ||
    !Number.isFinite(paidAmount) ||
    !Number.isFinite(expectedAmount) ||
    Math.abs(paidAmount - expectedAmount) > 0.009
  ) {
    console.error("[robokassa] amount mismatch", invoiceNumber, outSum, payment.amountValue);
    return;
  }

  await markRobokassaPaid(invoiceNumber);
}
