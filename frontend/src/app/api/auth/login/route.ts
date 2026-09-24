import { NextResponse } from "next/server";
import { AuthError, loginUser } from "@/lib/auth";
import { isValidEmail, normalizeEmail } from "@/lib/email-validation";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { applySessionCookie } from "@/lib/session";
import { getUserProfile } from "@/lib/user-profile-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`login:${ip}`, 20, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        {
          error: "Слишком много попыток входа. Попробуйте позже.",
          retryAfterSec: limit.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Введите корректный email латиницей (например name@mail.ru)" },
        { status: 400 }
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    const { session, token } = await loginUser({ email, password });

    let profile = null;
    try {
      profile = await getUserProfile(session.userId);
    } catch (err) {
      console.error("[api/auth/login] profile", err);
    }

    const res = NextResponse.json({
      ok: true,
      user: {
        email: profile?.email ?? session.email,
        name: profile?.name ?? session.name,
      },
      profile,
    });
    applySessionCookie(res, token);
    return res;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/login]", error);
    return NextResponse.json({ error: "Не удалось войти" }, { status: 500 });
  }
}
