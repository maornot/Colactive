import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasAdminConfig = Boolean(supabaseUrl && serviceRoleKey);

/**
 * Service-role client for server-only jobs (scanner, cron routes) that must
 * bypass RLS — e.g. writing tenders or reading every profile to notify.
 * Never import this into client or request-scoped user code.
 */
export function createAdminClient() {
  if (!hasAdminConfig) {
    throw new Error(
      "Supabase admin client is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createSupabaseClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
