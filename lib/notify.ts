import type { SupabaseClient } from "@supabase/supabase-js";
import {
  renderClosingReminderEmail,
  renderInstantNotificationEmail,
  renderWeeklyDigestEmail,
} from "@/lib/email/template";
import { sendEmail } from "@/lib/email/send";
import type { Prefs, Tender } from "@/lib/types";

type TenderRow = Omit<Tender, "body"> & { body: { id: string; name: string } | null };

/**
 * Emails every subscriber whose topics overlap a batch of freshly-approved
 * tenders, then stamps notified_at so a later cron run never re-sends them.
 * Runs after auto-approval (confidence ≥ 0.85) and after a manual admin approval.
 */
export async function notifyForApprovedTenders(
  supabase: SupabaseClient,
  tenderIds: string[]
): Promise<{ emailsSent: number }> {
  if (tenderIds.length === 0) return { emailsSent: 0 };

  const { data: rawTenders } = await supabase
    .from("tenders")
    .select("*, body:bodies(id, name)")
    .in("id", tenderIds)
    .eq("status", "approved")
    .is("notified_at", null);

  if (!rawTenders || rawTenders.length === 0) return { emailsSent: 0 };

  const tenders = (rawTenders as TenderRow[]).map((row) => ({
    ...row,
    bodyName: row.body?.name ?? "גוף לא ידוע",
  }));

  const { data: profiles } = await supabase.from("profiles").select("id, email, topics, prefs");

  let emailsSent = 0;

  for (const profile of profiles ?? []) {
    const prefs = profile.prefs as Prefs;
    if (!prefs?.instant) continue;

    const topics: string[] = profile.topics ?? [];
    const matches = tenders.filter((t) => t.topics.some((topic) => topics.includes(topic)));
    if (matches.length === 0) continue;

    const { subject, html } = renderInstantNotificationEmail(matches);
    const { id, error } = await sendEmail(profile.email, subject, html);
    if (error) continue;

    emailsSent++;
    await supabase.from("notifications").upsert(
      matches.map((t) => ({
        user_id: profile.id,
        tender_id: t.id,
        channel: "instant",
        sent_at: new Date().toISOString(),
        provider_id: id,
      })),
      { onConflict: "user_id,tender_id,channel" }
    );
  }

  await supabase
    .from("tenders")
    .update({ notified_at: new Date().toISOString() })
    .in(
      "id",
      tenders.map((t) => t.id)
    );

  return { emailsSent };
}

/** Three-day-before-deadline reminder, for anyone who saved that tender's body and turns prefs.closing on. */
export async function sendClosingReminders(supabase: SupabaseClient): Promise<{ emailsSent: number }> {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const { data: rawTenders } = await supabase
    .from("tenders")
    .select("*, body:bodies(id, name)")
    .eq("status", "approved")
    .gte("deadline_at", now.toISOString())
    .lte("deadline_at", in3Days.toISOString());

  const tenders = (rawTenders as TenderRow[] | null) ?? [];
  if (tenders.length === 0) return { emailsSent: 0 };

  const tendersByBodyId = new Map<string, TenderRow[]>();
  for (const t of tenders) {
    if (!t.body) continue;
    const list = tendersByBodyId.get(t.body.id) ?? [];
    list.push(t);
    tendersByBodyId.set(t.body.id, list);
  }

  const { data: saves } = await supabase
    .from("saved_sources")
    .select("user_id, body_id")
    .in("body_id", Array.from(tendersByBodyId.keys()));

  const { data: alreadySent } = await supabase
    .from("notifications")
    .select("user_id, tender_id")
    .eq("channel", "closing_reminder")
    .in(
      "tender_id",
      tenders.map((t) => t.id)
    );
  const sentSet = new Set((alreadySent ?? []).map((n) => `${n.user_id}:${n.tender_id}`));

  const { data: profiles } = await supabase.from("profiles").select("id, email, prefs");
  const profileMap = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  let emailsSent = 0;

  for (const save of saves ?? []) {
    const profile = profileMap.get(save.user_id);
    const prefs = profile?.prefs as Prefs | undefined;
    if (!profile || !prefs?.closing) continue;

    for (const tender of tendersByBodyId.get(save.body_id) ?? []) {
      const key = `${save.user_id}:${tender.id}`;
      if (sentSet.has(key)) continue;

      const { subject, html } = renderClosingReminderEmail({ ...tender, bodyName: tender.body?.name ?? "" });
      const { id, error } = await sendEmail(profile.email, subject, html);
      if (error) continue;

      emailsSent++;
      sentSet.add(key);
      await supabase.from("notifications").insert({
        user_id: save.user_id,
        tender_id: tender.id,
        channel: "closing_reminder",
        sent_at: new Date().toISOString(),
        provider_id: id,
      });
    }
  }

  return { emailsSent };
}

/** Sunday summary of everything approved in the last 7 days, for anyone with prefs.digest on. */
export async function sendWeeklyDigest(supabase: SupabaseClient): Promise<{ emailsSent: number }> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const { data: rawTenders } = await supabase
    .from("tenders")
    .select("*, body:bodies(id, name)")
    .eq("status", "approved")
    .gte("published_at", sevenDaysAgo.toISOString());

  const tenders = ((rawTenders as TenderRow[] | null) ?? []).map((row) => ({
    ...row,
    bodyName: row.body?.name ?? "גוף לא ידוע",
  }));
  if (tenders.length === 0) return { emailsSent: 0 };

  const { data: profiles } = await supabase.from("profiles").select("id, email, topics, prefs");

  let emailsSent = 0;

  for (const profile of profiles ?? []) {
    const prefs = profile.prefs as Prefs;
    if (!prefs?.digest) continue;

    const topics: string[] = profile.topics ?? [];
    const matches = tenders.filter((t) => t.topics.some((topic) => topics.includes(topic)));
    if (matches.length === 0) continue;

    const { subject, html } = renderWeeklyDigestEmail(matches);
    const { error } = await sendEmail(profile.email, subject, html);
    if (!error) emailsSent++;
  }

  return { emailsSent };
}
