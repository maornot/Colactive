export type BodyCategory = "government" | "municipal" | "ngo";
export type SourceKind = "portal" | "list" | "tenders_page";
export type SourceStatus = "ok" | "slow" | "error";

export interface Body {
  id: string;
  name: string;
  initials: string;
  category: BodyCategory;
  source_url: string;
  source_kind: SourceKind;
  adapter: string | null;
  verified: boolean;
  active: boolean;
  last_scan_at: string | null;
  last_status: SourceStatus;
  created_at: string;
}

export type ProcedureType = "קול קורא" | "מכרז פומבי" | "מסגרת הסכם" | "בקשה להצעות";
export type TenderStatus = "pending" | "approved" | "rejected";

export interface Tender {
  id: string;
  body_id: string;
  external_ref: string | null;
  title: string;
  summary: string | null;
  procedure_type: ProcedureType | null;
  topics: string[];
  budget_text: string | null;
  deadline_at: string | null;
  published_at: string | null;
  docs_url: string;
  content_hash: string;
  confidence: number | null;
  status: TenderStatus;
  notified_at: string | null;
  created_at: string;
  body?: Body;
}

export interface Prefs {
  instant: boolean;
  closing: boolean;
  digest: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string | null;
  topics: string[];
  prefs: Prefs;
  is_admin: boolean;
  confirmed: boolean;
  created_at: string;
}

export interface SavedSource {
  user_id: string;
  body_id: string;
  created_at: string;
}
