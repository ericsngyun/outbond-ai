import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // Basic health check without DB dependency for bootstrap
    // TODO: Add database health check once models are defined
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      services: {
        api: "healthy",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
