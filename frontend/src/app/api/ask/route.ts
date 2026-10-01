import { NextResponse } from "next/server";
import { generateAskAnswer } from "@/lib/deepseek";
import { releaseAsk, reserveAsk } from "@/lib/ai-limit-server";
import { AI_LIMITS, remainingFromCount } from "@/lib/ai-limits";
import { requireSession, AuthError } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const ip = getClientIp(request);
    const burst = await rateLimit(`ask:${session.userId}:${ip}`, 30, 60 * 60 * 1000);
    if (!burst.ok) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте позже.", retryAfterSec: burst.retryAfterSec },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { question?: string };
    const question = body.question?.trim();

    if (!question || question.length < 5) {
      return NextResponse.json({ error: "Введите вопрос (минимум 5 символов)" }, { status: 400 });
    }

    if (question.length > 2000) {
      return NextResponse.json({ error: "Вопрос слишком длинный" }, { status: 400 });
    }

    const limit = await reserveAsk(session.userId);
    if (!limit.ok) return limit.response;

    try {
      const answer = await generateAskAnswer(question);
      const remaining = remainingFromCount(limit.used, AI_LIMITS.ask);
      return NextResponse.json({ answer, remaining });
    } catch (error) {
      await releaseAsk(session.userId);
      throw error;
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/ask]", error);
    const message =
      error instanceof Error ? error.message : "Не удалось получить ответ. Попробуйте позже.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
