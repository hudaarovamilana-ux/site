import { createHash } from "crypto";

const API_URL = "https://lknpd.nalog.ru/api/v1";

type AuthResponse = {
  token?: string;
  refreshToken?: string;
  tokenExpireIn?: string;
  challengeToken?: string;
  message?: string;
};

type IncomeResponse = {
  approvedReceiptUuid?: string;
  message?: string;
};

type Session = {
  token: string;
  refreshToken: string;
  expiresAt: number;
};

let session: Session | null = null;

export function isMoyNalogConfigured(): boolean {
  return Boolean(getInn() && getPassword());
}

function getInn(): string {
  return (process.env.MOY_NALOG_INN ?? "860412760635").trim();
}

function getPassword(): string {
  return process.env.MOY_NALOG_PASSWORD?.trim() ?? "";
}

function deviceId(inn: string): string {
  const fromEnv = process.env.MOY_NALOG_DEVICE_ID?.trim();
  if (fromEnv) return fromEnv;
  return createHash("sha256").update(`womenshealth-nalog:${inn}`).digest("hex").slice(0, 32);
}

function formatOperationTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Yekaterinburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}:${pick("second")}.000+05:00`;
}

async function nalogFetch<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as T & {
    message?: string;
    code?: string;
  };

  if (!res.ok) {
    throw new Error(data.message || `Мой налог ответил ${res.status}`);
  }

  return data;
}

async function login(): Promise<Session> {
  const inn = getInn();
  const password = getPassword();
  if (!inn || !password) {
    throw new Error("Мой налог не настроен: задайте MOY_NALOG_INN и MOY_NALOG_PASSWORD");
  }

  const data = await nalogFetch<AuthResponse>("/auth/lkfl", {
    username: inn,
    password,
    deviceInfo: {
      sourceDeviceId: deviceId(inn),
      sourceType: "WEB",
      appVersion: "1.0.0",
      metaDetails: {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    },
  });

  if (!data.token || !data.refreshToken) {
    if (data.challengeToken) {
      throw new Error(
        "Мой налог запросил подтверждение устройства по SMS. Подтвердите вход и повторите оплату."
      );
    }
    throw new Error(data.message || "Не удалось войти в Мой налог");
  }

  const expiresAt = data.tokenExpireIn
    ? new Date(data.tokenExpireIn).getTime() - 60_000
    : Date.now() + 50 * 60_000;

  session = { token: data.token, refreshToken: data.refreshToken, expiresAt };
  return session;
}

async function getToken(): Promise<string> {
  if (session && session.expiresAt > Date.now()) return session.token;

  if (session?.refreshToken) {
    try {
      const data = await nalogFetch<AuthResponse>("/auth/token", {
        refreshToken: session.refreshToken,
        deviceInfo: {
          sourceDeviceId: deviceId(getInn()),
          sourceType: "WEB",
          appVersion: "1.0.0",
        },
      });
      if (data.token && data.refreshToken) {
        session = {
          token: data.token,
          refreshToken: data.refreshToken,
          expiresAt: data.tokenExpireIn
            ? new Date(data.tokenExpireIn).getTime() - 60_000
            : Date.now() + 50 * 60_000,
        };
        return session.token;
      }
    } catch {
      session = null;
    }
  }

  return (await login()).token;
}

export function receiptPrintUrl(receiptUuid: string): string {
  return `${API_URL}/receipt/${getInn()}/${receiptUuid}/print`;
}

export async function createIncomeReceipt(input: {
  name: string;
  amount: number;
  clientName?: string;
}): Promise<{ receiptUuid: string; receiptUrl: string }> {
  const token = await getToken();
  const now = formatOperationTime(new Date());
  const amount = Math.round(input.amount * 100) / 100;

  const data = await nalogFetch<IncomeResponse>(
    "/income",
    {
      operationTime: now,
      requestTime: now,
      services: [
        {
          name: input.name.slice(0, 256),
          amount,
          quantity: 1,
        },
      ],
      totalAmount: amount,
      client: {
        contactPhone: null,
        displayName: input.clientName?.trim() || null,
        incomeType: "FROM_INDIVIDUAL",
        inn: null,
      },
      paymentType: "CASH",
      ignoreMaxTotalIncomeRestriction: false,
    },
    token
  );

  if (!data.approvedReceiptUuid) {
    throw new Error(data.message || "Мой налог не вернул номер чека");
  }

  return {
    receiptUuid: data.approvedReceiptUuid,
    receiptUrl: receiptPrintUrl(data.approvedReceiptUuid),
  };
}

export async function sendOfficialReceiptEmail(
  receiptUuid: string,
  email: string
): Promise<boolean> {
  try {
    const token = await getToken();
    await nalogFetch(`/receipt/${getInn()}/${receiptUuid}/send`, { email }, token);
    return true;
  } catch (error) {
    console.error("[moy-nalog] official email send failed", error);
    return false;
  }
}
