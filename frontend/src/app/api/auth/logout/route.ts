import { NextResponse } from "next/server";
import { clearSessionCookieOnResponse } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  clearSessionCookieOnResponse(res);
  return res;
}
