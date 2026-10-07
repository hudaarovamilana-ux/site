import { randomUUID } from "crypto";
import type { PaidPlan } from "@/lib/premium";

const API_URL = "https://api.yookassa.ru/v3";

export type YooKassaPayment = {
  id: string;
  status: string;
  paid?: boolean;
  amount: { value: string; currency: string };
  confirmation?: { type: string; confirmation_url?: string };
  metadata?: Record<string, string>;
  description?: string;
};

function getCredentials(): { shopId: string; secretKey: string } {
  const shopId = process.env.YOOKASSA_SHOP_ID?.trim() ?? "";
  const secretKey = process.env.YOOKASSA_SECRET_KEY?.trim() ?? "";
  if (!shopId || !secretKey) {
    throw new Error("ЮKassa не настроена: задайте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY");
  }
  return { shopId, secretKey };
}

export function isYooKassaConfigured(): boolean {
  return Boolean(
    process.env.YOOKASSA_SHOP_ID?.trim() && process.env.YOOKASSA_SECRET_KEY?.trim()
  );
}

function authHeader(shopId: string, secretKey: string): string {
  return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`;
}

async function yooFetch<T>(
  path: string,
  init?: RequestInit & { idempotenceKey?: string }
): Promise<T> {
  const { shopId, secretKey } = getCredentials();
  const headers: Record<string, string> = {
    Authorization: authHeader(shopId, secretKey),
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.idempotenceKey) {
    headers["Idempotence-Key"] = init.idempotenceKey;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as T & {
    description?: string;
    code?: string;
  };

  if (!res.ok) {
    const message =
      typeof data.description === "string"
        ? data.description
        : `Ошибка ЮKassa (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export async function createYooKassaPayment(input: {
  plan: PaidPlan;
  returnUrl: string;
  customerEmail: string;
  metadata: Record<string, string>;
  idempotenceKey?: string;
}): Promise<YooKassaPayment> {
  return yooFetch<YooKassaPayment>("/payments", {
    method: "POST",
    idempotenceKey: input.idempotenceKey ?? randomUUID(),
    body: JSON.stringify({
      amount: {
        value: input.plan.amountValue,
        currency: "RUB",
      },
      capture: true,
      description: input.plan.description.slice(0, 128),
      confirmation: {
        type: "redirect",
        return_url: input.returnUrl,
      },
      metadata: input.metadata,
      receipt: {
        customer: {
          email: input.customerEmail,
        },
        items: [
          {
            description: input.plan.title.slice(0, 128),
            quantity: "1.00",
            amount: {
              value: input.plan.amountValue,
              currency: "RUB",
            },
            vat_code: 1,
            payment_mode: "full_payment",
            payment_subject: "service",
          },
        ],
      },
    }),
  });
}

export async function getYooKassaPayment(paymentId: string): Promise<YooKassaPayment> {
  return yooFetch<YooKassaPayment>(`/payments/${encodeURIComponent(paymentId)}`, {
    method: "GET",
  });
}
