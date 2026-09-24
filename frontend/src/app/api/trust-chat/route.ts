import { NextResponse } from "next/server";
import { generateTrustReply } from "@/lib/deepseek";
import { checkTrustLimit, incrementTrustCount } from "@/lib/ai-limit-server";
import { AI_LIMITS, remainingFromCount } from "@/lib/ai-limits";
import { requireSession, AuthError } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const ip = getClientIp(request);
    const burst = rateLimit(`trust:${session.userId}:${ip}`, 40, 60 * 60 * 1000);
    if (!burst.ok) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте позже.", retryAfterSec: burst.retryAfterSec },
        { status: 429 }
      );
    }

    const limit = await checkTrustLimit();
    if (!limit.ok) return limit.response;

    const body = (await request.json()) as {
      message?: string;
      history?: { role: "user" | "assistant"; text: string }[];
    };

    const message = body.message?.trim();
    if (!message || message.length < 2) {
      return NextResponse.json({ error: "Введите сообщение" }, { status: 400 });
    }

    if (message.length > 1500) {
      return NextResponse.json({ error: "Сообщение слишком длинное" }, { status: 400 });
    }

    const history = Array.isArray(body.history) ? body.history : [];
    const reply = await generateTrustReply(message, history);
    const remaining = remainingFromCount(limit.used + 1, AI_LIMITS.trustChat);

    const res = NextResponse.json({ reply, remaining });
    return incrementTrustCount(res, limit.used);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/trust-chat]", error);
    const message =
      error instanceof Error ? error.message : "Не удалось отправить сообщение. Попробуйте позже.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
