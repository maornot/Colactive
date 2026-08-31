"use client";

import { useMemo, useState } from "react";
import { CATS } from "@/lib/constants";
import { chipTone } from "@/lib/design";
import { hostOf, type VerifiedSource } from "@/lib/data/verified-sources";
import { useSavedSources } from "@/lib/hooks/useSavedSources";
import { Chip } from "./Chip";
import { ExternalLink } from "./ExternalLink";

interface FeedBoardProps {
  sources: VerifiedSource[];
  userId: string | null;
  bodyIds: Record<string, string>;
  initialSaved: string[];
  initialBody?: string;
}

export function FeedBoard({ sources, userId, bodyIds, initialSaved, initialBody }: FeedBoardProps) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>(CATS[0]);
  const [body, setBody] = useState(initialBody || "כל הגופים");
  const { saved, toggle } = useSavedSources(userId, initialSaved, bodyIds);

  const bodyOptions = useMemo(
    () => ["כל הגופים", ...sources.map((s) => s.body).sort((a, b) => a.localeCompare(b, "he"))],
    [sources]
  );

  const visible = useMemo(() => {
    const q = query.trim();
    return sources.filter(
      (s) =>
        (cat === "הכל" || s.tags.includes(cat)) &&
        (body === "כל הגופים" || s.body === body) &&
        (!q || (s.body + s.title + s.note + s.kind + s.tags.join(" ")).includes(q))
    );
  }, [sources, query, cat, body]);

  return (
    <section className="mx-auto max-w-[1200px] px-4 sm:px-[28px]">
      <div
        className="mb-6 flex flex-col gap-3.5 rounded-[18px] border p-[18px]"
        style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי נושא, גוף מפרסם או מספר הליך"
            className="min-w-[240px] flex-1 rounded-[10px] border px-4 py-3 text-[15px] outline-none"
            style={{ borderColor: "oklch(0.89 0.008 250)", background: "oklch(0.975 0.004 240)" }}
          />
          <select
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="rounded-[10px] border px-3.5 py-3 text-[15px] font-semibold"
            style={{ borderColor: "oklch(0.89 0.008 250)", background: "oklch(0.975 0.004 240)" }}
          >
            {bodyOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CATS.map((c) => (
            <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} tone={chipTone(cat === c)} />
          ))}
        </div>
      </div>

      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-5">
        <div className="text-[15px] font-bold" style={{ color: "oklch(0.42 0.012 250)" }}>
          {visible.length} מקורות מאומתים · מתוך {sources.length}
        </div>
        <div className="text-[13px]" style={{ color: "oklch(0.58 0.012 250)" }}>
          כל קישור נבדק מול אתר הגוף. המועדים והתקציבים מופיעים בעמוד עצמו.
        </div>
      </div>

      <div className="grid gap-3">
        {visible.map((item) => {
          const isSaved = saved.includes(item.body);
          return (
            <div
              key={item.body}
              className="grid grid-cols-1 gap-4 rounded-2xl border p-5 sm:grid-cols-[46px_1fr_auto] sm:p-[20px_22px]"
              style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}
            >
              <div
                className="hidden h-[46px] w-[46px] items-center justify-center rounded-xl border text-[15px] font-extrabold sm:flex"
                style={{
                  background: "oklch(0.945 0.008 250)",
                  borderColor: "oklch(0.91 0.008 250)",
                  color: "oklch(0.42 0.012 250)",
                }}
              >
                {item.initials}
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-bold" style={{ color: "oklch(0.42 0.13 145)" }}>
                    {item.body}
                  </span>
                  <span className="h-1 w-1 rounded-full" style={{ background: "oklch(0.82 0.008 250)" }} />
                  <span className="text-[13px] font-semibold" style={{ color: "oklch(0.55 0.012 250)" }}>
                    {item.kind}
                  </span>
                  <span
                    className="rounded-full px-[9px] py-[3px] text-xs font-extrabold"
                    style={{ background: "oklch(0.955 0.03 145)", color: "oklch(0.38 0.12 145)" }}
                  >
                    קישור מאומת
                  </span>
                </div>
                <div className="mb-[7px] text-xl font-bold leading-[1.25] tracking-[-0.02em]" style={{ textWrap: "pretty" }}>
                  {item.title}
                </div>
                <div
                  className="max-w-[62ch] text-[15px] leading-[1.5]"
                  style={{ color: "oklch(0.48 0.012 250)", textWrap: "pretty" }}
                >
                  {item.note}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md px-2.5 py-1 text-[13px] font-semibold"
                      style={{ color: "oklch(0.45 0.012 250)", background: "oklch(0.945 0.006 250)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-2.5 sm:min-w-[176px]">
                <ExternalLink
                  href={item.url}
                  className="rounded-[10px] px-[18px] py-3 text-center text-[15px] font-extrabold"
                  style={{ background: "oklch(0.24 0.012 250)", color: "oklch(0.98 0.003 240)" }}
                >
                  לעמוד הפרסומים ↗
                </ExternalLink>
                <button
                  type="button"
                  onClick={() => toggle(item.body)}
                  className="cursor-pointer rounded-[10px] border px-[18px] py-[11px] text-sm font-bold"
                  style={{ borderColor: "oklch(0.88 0.008 250)", color: "oklch(0.35 0.012 250)" }}
                >
                  {isSaved ? "במעקב ✓" : "הוספה למעקב"}
                </button>
                <div className="text-center text-xs" style={{ color: "oklch(0.58 0.012 250)" }}>
                  {hostOf(item.url)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="py-[60px] text-center text-base" style={{ color: "oklch(0.55 0.012 250)" }}>
          אין מקור מאומת שתואם לסינון הנוכחי.
        </div>
      )}

      <div
        className="mt-4 max-w-[78ch] rounded-[14px] border p-[18px_20px] text-sm leading-[1.55]"
        style={{ background: "oklch(0.965 0.005 250)", borderColor: "oklch(0.92 0.008 250)", color: "oklch(0.42 0.012 250)", textWrap: "pretty" }}
      >
        הלוח מציג רק מקורות שנבדקו מול אתר הגוף, ולא רשומות שנכתבו כדוגמה. פירוט הליך בודד — מספר מכרז, מועד אחרון
        ותקציב — מוצג באתר הגוף, ויוצג כאן ברגע שסורק הפרסומים יחובר.
      </div>
    </section>
  );
}
