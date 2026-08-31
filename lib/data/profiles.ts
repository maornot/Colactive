import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data as Profile | null;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Profile[];
}

export async function getSavedBodyNames(userId: string): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("saved_sources")
    .select("body:bodies(name)")
    .eq("user_id", userId);
  return (data ?? [])
    .map((row) => (row.body as unknown as { name: string } | null)?.name)
    .filter((name): name is string => Boolean(name));
}
