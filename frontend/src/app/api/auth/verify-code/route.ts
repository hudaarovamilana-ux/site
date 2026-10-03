import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/verification-store";
import { AuthError, registerUser } from "@/lib/auth";
import { isValidEmail, normalizeEmail } from "@/lib/email-validation";
import { LEGAL_DOCS_VERSION } from "@/lib/legal-docs";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { applySessionCookie } from "@/lib/session";
import { getUserProfile } from "@/lib/user-profile-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimit(`verify:${ip}`, 30, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Слишком много попыток. Попробуйте позже.", retryAfterSec: limit.retryAfterSec },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      email?: string;
      code?: string;
      password?: string;
      consentPd?: boolean;
      consentHealth?: boolean;
    };
    const email = normalizeEmail(body.email ?? "");
    const code = body.code?.trim() ?? "";
    const password = body.password ?? "";
    const consentPd = body.consentPd === true;
    const consentHealth = body.consentHealth === true;

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Введите корректный email латиницей" },
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
    if (!consentPd) {
      return NextResponse.json(
        { error: "Нужно согласие на обработку персональных данных" },
        { status: 400 }
      );
    }
    if (!consentHealth) {
      return NextResponse.json(
        { error: "Нужно согласие на обработку сведений о здоровье" },
        { status: 400 }
      );
    }

    const result = await verifyCode(email, code);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    const { session, token } = await registerUser({
      email,
      name: result.name,
      password,
      consentPd,
      consentHealth,
      consentDocsVersion: LEGAL_DOCS_VERSION,
    });

    let profile = null;
    try {
      profile = await getUserProfile(session.userId);
    } catch {
      /* ignore */
    }

    const res = NextResponse.json({
      ok: true,
      verified: true,
      name: session.name,
      email: session.email,
      profile,
    });
    applySessionCookie(res, token);
    return res;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/verify-code]", error);
    return NextResponse.json({ error: "Не удалось проверить код" }, { status: 500 });
  }
}
