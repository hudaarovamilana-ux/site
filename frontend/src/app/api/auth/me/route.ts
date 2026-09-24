import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { isDatabaseConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      authenticated: true,
      user: { email: session.email, name: session.name },
      profile: null,
    });
  }

  try {
    const { getUserProfile } = await import("@/lib/user-profile-server");
    const profile = await getUserProfile(session.userId);
    return NextResponse.json({
      authenticated: true,
      user: {
        email: profile?.email ?? session.email,
        name: profile?.name ?? session.name,
      },
      profile,
    });
  } catch (error) {
    console.error("[api/auth/me]", error);
    return NextResponse.json({
      authenticated: true,
      user: { email: session.email, name: session.name },
      profile: null,
    });
  }
}
