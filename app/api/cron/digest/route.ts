import { NextResponse } from "next/server";
import { createAdminClient, hasAdminConfig } from "@/lib/supabase/admin";
import { sendWeeklyDigest } from "@/lib/notify";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasAdminConfig) {
    return NextResponse.json({ error: "supabase admin client is not configured" }, { status: 503 });
  }

  const result = await sendWeeklyDigest(createAdminClient());
  return NextResponse.json(result);
}
