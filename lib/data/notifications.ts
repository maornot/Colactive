import { createClient } from "@/lib/supabase/server";

export async function getMonthlyNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("sent_at", monthStart.toISOString());

  return count ?? 0;
}
