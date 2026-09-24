import { NextResponse } from "next/server";
import { AuthError, requireDatabase } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { isValidEmail, normalizeEmail } from "@/lib/email-validation";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  canSendResetCode,
  generateResetCode,
  saveResetCode,
} from "@/lib/password-reset-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = rateLimit(`forgot-password:${ip}`, 10, 60 * 60 * 1000);
    if (!ipLimit.ok) {
      return NextResponse.json(
        {
          error: "Слишком много запросов с этого адреса. Попробуйте позже.",
          retryAfterSec: ipLimit.retryAfterSec,
        },
        { status: 429 }
      );
    }

    await requireDatabase();

    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email ?? "");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Введите корректный email латиницей (например name@mail.ru)" },
        { status: 400 }
      );
    }

    const limit = canSendResetCode(email);
    if (!limit.ok) {
      return NextResponse.json(
        { error: limit.reason, retryAfterSec: limit.retryAfterSec },
        { status: 429 }
      );
    }

    // Не раскрываем, есть ли аккаунт: ответ всегда одинаковый.
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const code = generateResetCode();
      saveResetCode(email, code);
      await sendPasswordResetEmail(email, code);
    }

    return NextResponse.json({
      ok: true,
      message:
        "Если аккаунт с таким email существует, мы отправили код для сброса пароля.",
      expiresInSec: 600,
    });
  } catch (error) {
    console.error("[api/auth/forgot-password/send-code]", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Не удалось отправить код. Попробуйте позже.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
