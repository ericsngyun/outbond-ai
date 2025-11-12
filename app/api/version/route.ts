import { NextResponse } from "next/server";
import packageJson from "@/package.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    version: packageJson.version,
    name: packageJson.name,
    description: packageJson.description,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
