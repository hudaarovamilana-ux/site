import { createHash, randomInt } from "crypto";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

interface PendingVerification {
  codeHash: string;
  name: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  sendCount: number;
  sendWindowStart: number;
}

const pending = new Map<string, PendingVerification>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashCode(email: string, code: string): string {
  return createHash("sha256").update(`${email}:${code}:${process.env.VERIFICATION_SECRET ?? "zk-dev"}`).digest("hex");
}

export function generateVerificationCode(): string {
  return String(randomInt(100000, 999999));
}

export function canSendCode(email: string): { ok: true } | { ok: false; reason: string; retryAfterSec?: number } {
  const key = normalizeEmail(email);
  const existing = pending.get(key);
  if (!existing) return { ok: true };

  const now = Date.now();
  const sinceLast = now - existing.lastSentAt;
  if (sinceLast < RESEND_COOLDOWN_MS) {
    return {
      ok: false,
      reason: "Подождите перед повторной отправкой",
      retryAfterSec: Math.ceil((RESEND_COOLDOWN_MS - sinceLast) / 1000),
    };
  }

  if (now - existing.sendWindowStart > 60 * 60 * 1000) {
    return { ok: true };
  }

  if (existing.sendCount >= MAX_SENDS_PER_HOUR) {
    return { ok: false, reason: "Слишком много запросов. Попробуйте через час." };
  }

  return { ok: true };
}

export function saveVerificationCode(email: string, name: string, code: string): void {
  const key = normalizeEmail(email);
  const now = Date.now();
  const existing = pending.get(key);
  const sameWindow = existing && now - existing.sendWindowStart <= 60 * 60 * 1000;

  pending.set(key, {
    codeHash: hashCode(key, code),
    name: name.trim(),
    expiresAt: now + CODE_TTL_MS,
    attempts: 0,
    lastSentAt: now,
    sendCount: sameWindow ? (existing?.sendCount ?? 0) + 1 : 1,
    sendWindowStart: sameWindow ? (existing?.sendWindowStart ?? now) : now,
  });
}

export function verifyCode(
  email: string,
  code: string
): { ok: true; name: string } | { ok: false; reason: string } {
  const key = normalizeEmail(email);
  const entry = pending.get(key);

  if (!entry) {
    return { ok: false, reason: "Код не найден. Запросите новый." };
  }

  if (Date.now() > entry.expiresAt) {
    pending.delete(key);
    return { ok: false, reason: "Код истёк. Запросите новый." };
  }

  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    pending.delete(key);
    return { ok: false, reason: "Превышено число попыток. Запросите новый код." };
  }

  entry.attempts += 1;

  if (hashCode(key, code.trim()) !== entry.codeHash) {
    return { ok: false, reason: "Неверный код. Проверьте письмо и попробуйте снова." };
  }

  pending.delete(key);
  return { ok: true, name: entry.name };
}

export function getPendingName(email: string): string | null {
  return pending.get(normalizeEmail(email))?.name ?? null;
}
