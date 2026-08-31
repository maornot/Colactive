import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RawItem, SourceAdapter } from "./adapters/types";
import { classify, passesGrossFilter } from "./classify";
import { notifyForApprovedTenders } from "@/lib/notify";

const AUTO_APPROVE_THRESHOLD = 0.85;

function contentHashOf(item: RawItem): string {
  const basis = item.externalRef || `${item.title}|${item.docsUrl}`;
  return createHash("sha256").update(basis).digest("hex");
}

export interface ScanSummary {
  bodyName: string;
  found: number;
  passedFilter: number;
  inserted: number;
  approved: number;
  error?: string;
}

async function scanOneBody(supabase: SupabaseClient, adapter: SourceAdapter): Promise<{ summary: ScanSummary; approvedIds: string[] }> {
  const summary: ScanSummary = { bodyName: adapter.bodyName, found: 0, passedFilter: 0, inserted: 0, approved: 0 };
  const approvedIds: string[] = [];

  const { data: body } = await supabase.from("bodies").select("id").eq("name", adapter.bodyName).maybeSingle();
  if (!body) {
    summary.error = `no bodies row named "${adapter.bodyName}" — seed it first`;
    return { summary, approvedIds };
  }

  let raw: RawItem[];
  try {
    raw = await adapter.fetch();
  } catch (e) {
    summary.error = e instanceof Error ? e.message : String(e);
    await supabase.from("bodies").update({ last_status: "error", last_scan_at: new Date().toISOString() }).eq("id", body.id);
    return { summary, approvedIds };
  }

  summary.found = raw.length;
  const relevant = raw.filter(passesGrossFilter);
  summary.passedFilter = relevant.length;

  for (const item of relevant) {
    const { topics, confidence } = classify(item);
    if (topics.length === 0) continue;

    const status = confidence >= AUTO_APPROVE_THRESHOLD ? "approved" : "pending";
    const contentHash = contentHashOf(item);

    const { data: inserted, error } = await supabase
      .from("tenders")
      .upsert(
        {
          body_id: body.id,
          external_ref: item.externalRef ?? null,
          title: item.title,
          summary: item.summary ?? null,
          procedure_type: item.procedureType ?? null,
          topics,
          budget_text: item.budgetText ?? null,
          deadline_at: item.deadlineAt?.toISOString() ?? null,
          published_at: (item.publishedAt ?? new Date()).toISOString(),
          docs_url: item.docsUrl,
          content_hash: contentHash,
          confidence,
          status,
        },
        { onConflict: "body_id,content_hash", ignoreDuplicates: true }
      )
      .select("id, status")
      .maybeSingle();

    if (error) continue;
    if (inserted) {
      summary.inserted++;
      if (inserted.status === "approved") {
        summary.approved++;
        approvedIds.push(inserted.id);
      }
    }
  }

  await supabase
    .from("bodies")
    .update({ last_status: "ok", last_scan_at: new Date().toISOString() })
    .eq("id", body.id);

  return { summary, approvedIds };
}

export async function runScan(supabase: SupabaseClient, adapters: SourceAdapter[]) {
  const summaries: ScanSummary[] = [];
  const allApprovedIds: string[] = [];

  for (const adapter of adapters) {
    const { summary, approvedIds } = await scanOneBody(supabase, adapter);
    summaries.push(summary);
    allApprovedIds.push(...approvedIds);
  }

  const { emailsSent } = await notifyForApprovedTenders(supabase, allApprovedIds);

  return { summaries, emailsSent };
}
