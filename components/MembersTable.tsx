"use client";

import { useMemo, useState } from "react";
import { memberStateTone } from "@/lib/design";
import type { Profile } from "@/lib/types";

const FILTERS = ["כל הנרשמים", "מאומת", "ממתין לאימות"] as const;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function MembersTable({ members }: { members: Profile[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("כל הנרשמים");

  const filtered = useMemo(() => {
    const q = query.trim();
    return members.filter((m) => {
      const state = m.confirmed ? "מאומת" : "ממתין לאימות";
      const matchesFilter = filter === "כל הנרשמים" || state === filter;
      const matchesQuery = !q || `${m.full_name}${m.email}${m.role ?? ""}`.includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [members, query, filter]);

  return (
    <div
      className="mb-6 rounded-[18px] border p-5 sm:p-[22px_24px]"
      style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[19px] font-extrabold tracking-[-0.02em]">נרשמים לאתר</div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "oklch(0.55 0.012 250)" }}>
            {filtered.length} מתוך {members.length} נרשמים
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש שם, מייל או תחום"
            className="min-w-[210px] rounded-[10px] border px-3.5 py-2.5 text-sm outline-none"
            style={{ borderColor: "oklch(0.89 0.008 250)", background: "oklch(0.975 0.004 240)" }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as (typeof FILTERS)[number])}
            className="rounded-[10px] border px-3 py-2.5 text-sm font-semibold"
            style={{ borderColor: "oklch(0.89 0.008 250)", background: "oklch(0.975 0.004 240)" }}
          >
            {FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div
            className="grid grid-cols-[1.5fr_1.3fr_1.5fr_0.7fr_0.6fr] gap-3 border-b pb-2.5 text-[13px] font-bold"
            style={{ borderColor: "oklch(0.92 0.008 250)", color: "oklch(0.55 0.012 250)" }}
          >
            <div>נרשם</div>
            <div>תחום</div>
            <div>תחומי התראה</div>
            <div>נרשם בתאריך</div>
            <div>מצב</div>
          </div>
          {filtered.map((m) => {
            const state = m.confirmed ? "מאומת" : "ממתין לאימות";
            const tone = memberStateTone(state);
            return (
              <div
                key={m.id}
                className="grid grid-cols-[1.5fr_1.3fr_1.5fr_0.7fr_0.6fr] items-center gap-3 border-b py-3.5 text-sm"
                style={{ borderColor: "oklch(0.94 0.008 250)" }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold"
                    style={{ background: "oklch(0.945 0.008 250)", borderColor: "oklch(0.91 0.008 250)", color: "oklch(0.42 0.012 250)" }}
                  >
                    {initialsOf(m.full_name)}
                  </span>
                  <span>
                    <span className="block font-bold">{m.full_name}</span>
                    <span className="block text-[13px]" style={{ color: "oklch(0.52 0.012 250)" }}>
                      {m.email}
                    </span>
                  </span>
                </div>
                <div className="font-semibold" style={{ color: "oklch(0.4 0.012 250)" }}>
                  {m.role ?? "—"}
                </div>
                <div className="text-[13px] leading-[1.4]" style={{ color: "oklch(0.5 0.012 250)" }}>
                  {m.topics.join(" · ") || "—"}
                </div>
                <div className="text-[13px]" style={{ color: "oklch(0.5 0.012 250)" }}>
                  {formatDate(m.created_at)}
                </div>
                <div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[13px] font-extrabold"
                    style={{ background: tone.bg, color: tone.color }}
                  >
                    {state}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3.5 text-[13px]" style={{ color: "oklch(0.55 0.012 250)" }}>
        אחוז פתיחת המיילים מוצג לכל נרשם בדוח החודשי. ייצוא הרשימה ל-CSV דורש שרת.
      </div>
    </div>
  );
}
