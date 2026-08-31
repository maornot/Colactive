"use client";

import { useState, useTransition } from "react";
import { approveTender, rejectTender } from "@/app/actions/admin";
import { confidenceTone } from "@/lib/design";
import type { PendingTenderRow } from "@/lib/data/tenders";

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.round(hours / 24)} ימים`;
}

export function AdminQueue({ items }: { items: PendingTenderRow[] }) {
  const [handled, setHandled] = useState<Record<string, "approved" | "rejected">>({});
  const [pending, startTransition] = useTransition();

  const visible = items.filter((item) => !handled[item.id]);

  function handle(id: string, action: "approved" | "rejected") {
    startTransition(async () => {
      try {
        if (action === "approved") await approveTender(id);
        else await rejectTender(id);
        setHandled((cur) => ({ ...cur, [id]: action }));
      } catch {
        // Leave the row visible so the admin can retry.
      }
    });
  }

  return (
    <div
      className="mb-6 rounded-[18px] border p-5 sm:p-[22px_24px]"
      style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <div className="text-[19px] font-extrabold tracking-[-0.02em]">ממתין לאישור לפני פרסום</div>
        <div className="text-sm font-semibold" style={{ color: "oklch(0.55 0.012 250)" }}>
          {visible.length} ממתינים
        </div>
      </div>
      <div className="grid gap-2.5">
        {visible.map((item) => {
          const confidence = Math.round((item.confidence ?? 0) * 100);
          const tone = confidenceTone(confidence);
          return (
            <div
              key={item.id}
              className="grid grid-cols-1 items-center gap-4 rounded-xl border p-[15px_17px] sm:grid-cols-[1fr_auto]"
              style={{ borderColor: "oklch(0.92 0.008 250)" }}
            >
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-bold" style={{ color: "oklch(0.42 0.13 145)" }}>
                    {item.bodyName}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "oklch(0.55 0.012 250)" }}>
                    נאסף {timeAgo(item.created_at)}
                  </span>
                  <span
                    className="rounded-full px-[9px] py-[3px] text-xs font-extrabold"
                    style={{ background: tone.bg, color: tone.color }}
                  >
                    התאמה {confidence}%
                  </span>
                </div>
                <div className="text-base font-bold leading-[1.3]">{item.title}</div>
                <div className="mt-[3px] text-[13px]" style={{ color: "oklch(0.55 0.012 250)" }}>
                  סווג אוטומטית כ־{item.topics.join(", ") || "לא סווג"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handle(item.id, "approved")}
                  className="cursor-pointer rounded-[9px] border-none px-[18px] py-2.5 text-sm font-extrabold disabled:opacity-60"
                  style={{ background: "oklch(0.62 0.15 145)", color: "oklch(0.16 0.03 145)" }}
                >
                  אישור ושליחה
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handle(item.id, "rejected")}
                  className="cursor-pointer rounded-[9px] border bg-transparent px-4 py-2.5 text-sm font-bold disabled:opacity-60"
                  style={{ borderColor: "oklch(0.88 0.008 250)", color: "oklch(0.4 0.012 250)" }}
                >
                  לא רלוונטי
                </button>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="py-3.5 text-[15px]" style={{ color: "oklch(0.55 0.012 250)" }}>
            אין פרסומים הממתינים לאישור כרגע.
          </div>
        )}
      </div>
    </div>
  );
}
