import { createClient } from "@/lib/supabase/server";
import type { Tender } from "@/lib/types";

export interface PendingTenderRow extends Tender {
  bodyName: string;
}

/** Publications the classifier scored below the auto-approve threshold — the admin approval queue. */
export async function getPendingTenders(): Promise<PendingTenderRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("tenders")
    .select("*, body:bodies(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    ...row,
    bodyName: (row.body as unknown as { name: string } | null)?.name ?? "גוף לא ידוע",
  }));
}

/** Body name → count of currently-approved (open) tenders, for the directory's "open procedures" line. */
export async function getApprovedCountsByBodyName(): Promise<Record<string, number>> {
  const supabase = await createClient();
  if (!supabase) return {};

  const { data } = await supabase.from("tenders").select("body:bodies(name)").eq("status", "approved");

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const name = (row.body as unknown as { name: string } | null)?.name;
    if (name) counts[name] = (counts[name] ?? 0) + 1;
  }
  return counts;
}

export async function getPendingCount(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("tenders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export interface AdminStats {
  activeBodies: number;
  handledCount: number;
  totalTenders: number;
  memberCount: number;
  emailDeliveryRate: number | null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  if (!supabase) return { activeBodies: 0, handledCount: 0, totalTenders: 0, memberCount: 0, emailDeliveryRate: null };

  const [{ count: activeBodies }, { count: totalTenders }, { count: pending }, { count: memberCount }, { count: totalNotifications }, { count: sentNotifications }] =
    await Promise.all([
      supabase.from("bodies").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("tenders").select("id", { count: "exact", head: true }),
      supabase.from("tenders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("notifications").select("id", { count: "exact", head: true }),
      supabase.from("notifications").select("id", { count: "exact", head: true }).not("sent_at", "is", null),
    ]);

  return {
    activeBodies: activeBodies ?? 0,
    totalTenders: totalTenders ?? 0,
    handledCount: (totalTenders ?? 0) - (pending ?? 0),
    memberCount: memberCount ?? 0,
    emailDeliveryRate: totalNotifications ? Math.round(((sentNotifications ?? 0) / totalNotifications) * 1000) / 10 : null,
  };
}
