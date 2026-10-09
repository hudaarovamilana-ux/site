import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidResultSignature, markRobokassaPaid } from "@/lib/robokassa";

export const runtime = "nodejs";

function pick(params: URLSearchParams, ...names: string[]): string {
  for (const name of names) {
    const direct = params.get(name);
    if (direct) return direct;
  }
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  for (const [key, value] of params.entries()) {
    if (wanted.has(key.toLowerCase()) && value) return value;
  }
  return "";
}

async function readParams(request: Request): Promise<URLSearchParams> {
  if (request.method === "GET") {
    return new URL(request.url).searchParams;
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(json)) {
      if (value != null) params.set(key, String(value));
    }
    return params;
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") params.set(key, value);
    }
    return params;
  }

  return new URLSearchParams(await request.text());
}

function plain(body: string, status = 200): NextResponse {
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function handle(request: Request): Promise<NextResponse> {
  try {
    const params = await readParams(request);
    const outSum = pick(params, "OutSum");
    const invId = pick(params, "InvId");
    const signature = pick(params, "SignatureValue");
    const paymentId = pick(params, "Shp_payment");

    if (!outSum || !invId || !signature || !paymentId) {
      return plain("missing params", 400);
    }

    if (
      !isValidResultSignature({
        outSum,
        invoiceNumber: invId,
        paymentId,
        signature,
      })
    ) {
      console.error("[api/payments/robokassa] bad signature", invId);
      return plain("bad sign", 400);
    }

    const invoiceNumber = Number(invId);
    if (!Number.isInteger(invoiceNumber)) {
      return plain("bad invoice", 400);
    }

    const payment = await prisma.payment.findUnique({ where: { invoiceNumber } });
    if (!payment || payment.id !== paymentId) {
      console.error("[api/payments/robokassa] payment not found", invId);
      return plain("payment not found", 404);
    }

    const paidAmount = Number(outSum);
    const expectedAmount = Number(payment.amountValue);
    if (
      !Number.isFinite(paidAmount) ||
      !Number.isFinite(expectedAmount) ||
      Math.abs(paidAmount - expectedAmount) > 0.009
    ) {
      console.error("[api/payments/robokassa] amount mismatch", invId, outSum);
      return plain("bad amount", 400);
    }

    await markRobokassaPaid(invoiceNumber);
    return plain(`OK${invId}`);
  } catch (error) {
    console.error("[api/payments/robokassa]", error);
    return plain("error", 500);
  }
}

export function GET(request: Request) {
  return handle(request);
}

export function POST(request: Request) {
  return handle(request);
}
