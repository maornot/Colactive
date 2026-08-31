import { createClient } from "@/lib/supabase/server";
import type { Body } from "@/lib/types";

export interface ScanSourceRow {
  body: string;
  lastScanAt: string | null;
  lastStatus: Body["last_status"];
  count30d: number;
}

/** Verified, actively-scanned bodies with their tender volume in the last 30 days — for the admin "מקורות סריקה" table. */
export async function getScanSources(): Promise<ScanSourceRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: bodies } = await supabase
    .from("bodies")
    .select("id, name, last_scan_at, last_status")
    .eq("verified", true)
    .eq("active", true)
    .order("name");

  if (!bodies || bodies.length === 0) return [];

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: tenders } = await supabase
    .from("tenders")
    .select("body_id")
    .gte("published_at", since);

  const counts = new Map<string, number>();
  for (const t of tenders ?? []) {
    counts.set(t.body_id, (counts.get(t.body_id) ?? 0) + 1);
  }

  return bodies.map((b) => ({
    body: b.name,
    lastScanAt: b.last_scan_at,
    lastStatus: b.last_status,
    count30d: counts.get(b.id) ?? 0,
  }));
}

export async function getLastScanLabel(): Promise<string> {
  const supabase = await createClient();
  if (!supabase) return "—";

  const { data } = await supabase
    .from("bodies")
    .select("last_scan_at")
    .eq("active", true)
    .not("last_scan_at", "is", null)
    .order("last_scan_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.last_scan_at) return "—";

  return new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jerusalem",
  }).format(new Date(data.last_scan_at));
}

/** name → id for verified bodies, so the client can resolve a save/track toggle to a foreign key. */
export async function getBodyIdMap(): Promise<Record<string, string>> {
  const supabase = await createClient();
  if (!supabase) return {};
  const { data } = await supabase.from("bodies").select("id, name").eq("verified", true);
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.name] = row.id;
  return map;
}

export async function getVerifiedBodyCount(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("bodies")
    .select("id", { count: "exact", head: true })
    .eq("verified", true);
  return count ?? 0;
}
