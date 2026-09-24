import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/lib/auth";
import { getUserProfile, saveUserProfile } from "@/lib/user-profile-server";
import type { HealthProfile, OnboardingData } from "@/lib/profile-types";
import type { UserStatus } from "@/lib/types";

export const runtime = "nodejs";

const VALID_STATUSES: UserStatus[] = ["pregnant", "not_pregnant", "planning"];

export async function GET() {
  try {
    const session = await requireSession();
    const profile = await getUserProfile(session.userId);
    if (!profile) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/profile GET]", error);
    return NextResponse.json({ error: "Не удалось загрузить профиль" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      name?: string;
      status?: UserStatus | null;
      onboarding?: OnboardingData | null;
      healthProfile?: HealthProfile | null;
      checklist?: Record<string, string> | null;
    };

    if (body.status != null && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
    }

    const profile = await saveUserProfile(session.userId, {
      name: body.name,
      status: body.status,
      onboarding: body.onboarding,
      healthProfile: body.healthProfile,
      checklist: body.checklist,
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/profile PUT]", error);
    return NextResponse.json({ error: "Не удалось сохранить профиль" }, { status: 500 });
  }
}
