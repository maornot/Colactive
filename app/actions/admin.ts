"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyForApprovedTenders } from "@/lib/notify";

async function requireAdminClient() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) throw new Error("not an admin");

  return supabase;
}

export async function approveTender(tenderId: string) {
  const supabase = await requireAdminClient();
  // RLS ("admins can update tenders") enforces the is_admin check server-side too.
  const { error } = await supabase.from("tenders").update({ status: "approved" }).eq("id", tenderId);
  if (error) throw new Error(error.message);

  await notifyForApprovedTenders(supabase, [tenderId]);
  revalidatePath("/admin");
}

export async function rejectTender(tenderId: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase.from("tenders").update({ status: "rejected" }).eq("id", tenderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
