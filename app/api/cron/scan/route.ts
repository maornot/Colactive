import { NextResponse } from "next/server";
import { createAdminClient, hasAdminConfig } from "@/lib/supabase/admin";
import { createMrGovIlAdapter } from "@/scanner/adapters/mr-gov-il";
import { runScan } from "@/scanner/run";

export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasAdminConfig) {
    return NextResponse.json({ error: "supabase admin client is not configured" }, { status: 503 });
  }

  const supabase = createAdminClient();
  const result = await runScan(supabase, [createMrGovIlAdapter()]);

  return NextResponse.json(result);
}
