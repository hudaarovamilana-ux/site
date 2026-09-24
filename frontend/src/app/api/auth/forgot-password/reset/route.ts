import { NextResponse } from "next/server";
import { AuthError, resetUserPassword } from "@/lib/auth";
import { isValidEmail, normalizeEmail } from "@/lib/email-validation";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyResetCode } from "@/lib/password-reset-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = rateLimit(`reset-password:${ip}`, 20, 60 * 60 * 1000);
    if (!ipLimit.ok) {
      return NextResponse.json(
        {
          error: "Слишком много попыток. Попробуйте позже.",
          retryAfterSec: ipLimit.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      email?: string;
      code?: string;
      password?: string;
    };
    const email = normalizeEmail(body.email ?? "");
    const code = body.code?.trim() ?? "";
    const password = body.password ?? "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Введите корректный email латиницей (например name@mail.ru)" },
        { status: 400 }
      );
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Введите 6-значный код из письма" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен быть не менее 6 символов" },
        { status: 400 }
      );
    }

    const verified = verifyResetCode(email, code);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.reason }, { status: 400 });
    }

    await resetUserPassword({ email, password });

    return NextResponse.json({
      ok: true,
      message: "Пароль успешно изменён. Теперь можно войти с новым паролем.",
    });
  } catch (error) {
    console.error("[api/auth/forgot-password/reset]", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Не удалось сменить пароль. Попробуйте позже.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
