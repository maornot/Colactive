"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseConfig, supabaseAnonKey, supabaseUrl } from "./env";

export function createClient() {
  if (!hasSupabaseConfig) {
    throw new Error(
      "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
