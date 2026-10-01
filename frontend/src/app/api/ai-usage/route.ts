import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/lib/auth";
import { getAiUsageCounts } from "@/lib/ai-limit-server";
import { AI_LIMITS, remainingFromCount } from "@/lib/ai-limits";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession();
    const counts = await getAiUsageCounts(session.userId);

    return NextResponse.json({
      health: {
        limit: AI_LIMITS.healthAssessment,
        used: counts.healthUsed ? 1 : 0,
        remaining: counts.healthUsed ? 0 : 1,
      },
      ask: {
        limit: AI_LIMITS.ask,
        used: counts.askUsed,
        remaining: remainingFromCount(counts.askUsed, AI_LIMITS.ask),
      },
      trust: {
        limit: AI_LIMITS.trustChat,
        used: counts.trustUsed,
        remaining: remainingFromCount(counts.trustUsed, AI_LIMITS.trustChat),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/ai-usage]", error);
    return NextResponse.json({ error: "Не удалось загрузить лимиты" }, { status: 500 });
  }
}
