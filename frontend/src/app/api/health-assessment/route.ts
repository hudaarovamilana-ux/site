import { NextResponse } from "next/server";
import { generateHealthAssessment } from "@/lib/deepseek";
import { buildHealthProfileSummary } from "@/lib/health-profile-summary";
import {
  checkHealthLimit,
  markHealthUsed,
} from "@/lib/ai-limit-server";
import { AI_LIMITS, remainingFromCount } from "@/lib/ai-limits";
import type { OnboardingData, HealthProfile } from "@/lib/profile-types";
import type { UserStatus } from "@/lib/types";
import { requireSession, AuthError } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const VALID_STATUSES: UserStatus[] = ["pregnant", "not_pregnant", "planning"];

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const ip = getClientIp(request);
    const burst = rateLimit(`health:${session.userId}:${ip}`, 10, 60 * 60 * 1000);
    if (!burst.ok) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте позже.", retryAfterSec: burst.retryAfterSec },
        { status: 429 }
      );
    }

    const limit = await checkHealthLimit();
    if (!limit.ok) return limit.response;

    const body = (await request.json()) as {
      status?: UserStatus;
      profile?: HealthProfile;
      onboarding?: OnboardingData | null;
    };

    const status = body.status;
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Некорректный статус пользователя" }, { status: 400 });
    }

    const summary = buildHealthProfileSummary({
      status,
      profile: body.profile ?? {},
      onboarding: body.onboarding ?? null,
    });

    const assessment = await generateHealthAssessment(summary);

    const res = NextResponse.json({
      assessment,
      remaining: remainingFromCount(1, AI_LIMITS.healthAssessment),
    });

    return markHealthUsed(res);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/health-assessment]", error);
    const message =
      error instanceof Error ? error.message : "Не удалось получить оценку. Попробуйте позже.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
