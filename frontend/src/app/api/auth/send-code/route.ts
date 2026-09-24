import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { isValidEmail, normalizeEmail } from "@/lib/email-validation";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  canSendCode,
  generateVerificationCode,
  saveVerificationCode,
} from "@/lib/verification-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = rateLimit(`send-code:${ip}`, 15, 60 * 60 * 1000);
    if (!ipLimit.ok) {
      return NextResponse.json(
        {
          error: "Слишком много запросов с этого адреса. Попробуйте позже.",
          retryAfterSec: ipLimit.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { email?: string; name?: string };
    const email = normalizeEmail(body.email ?? "");
    const name = body.name?.trim() ?? "";

    if (!name) {
      return NextResponse.json({ error: "Введите имя" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Введите корректный email латиницей (например name@mail.ru)" },
        { status: 400 }
      );
    }

    const limit = canSendCode(email);
    if (!limit.ok) {
      return NextResponse.json(
        { error: limit.reason, retryAfterSec: limit.retryAfterSec },
        { status: 429 }
      );
    }

    const code = generateVerificationCode();
    saveVerificationCode(email, name, code);
    await sendVerificationEmail(email, code);

    return NextResponse.json({
      ok: true,
      message: "Код отправлен на почту",
      expiresInSec: 600,
    });
  } catch (error) {
    console.error("[api/auth/send-code]", error);
    const message =
      error instanceof Error ? error.message : "Не удалось отправить код. Попробуйте позже.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
