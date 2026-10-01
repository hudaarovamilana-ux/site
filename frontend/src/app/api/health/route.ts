import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { status: "degraded", service: "zhenskaya-konsultaciya", database: "missing" },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      service: "zhenskaya-konsultaciya",
      database: "ok",
    });
  } catch (error) {
    console.error("[api/health]", error);
    return NextResponse.json(
      { status: "degraded", service: "zhenskaya-konsultaciya", database: "down" },
      { status: 503 }
    );
  }
}
