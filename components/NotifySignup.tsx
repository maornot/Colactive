"use client";

import { useState } from "react";
import { TOPICS } from "@/lib/constants";
import { chipToneDark } from "@/lib/design";
import { REAL } from "@/lib/data/verified-sources";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { Chip } from "./Chip";

const EMAIL_RE = /.+@.+\..+/;

export function NotifySignup() {
  const [email, setEmail] = useState("");
  const [topics, setTopics] = useState<string[]>(["עיצוב גרפי", "אנימציה ומושן"]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleTopic(t: string) {
    setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : cur.concat(t)));
    setNote("");
  }

  async function onSubscribe() {
    if (!EMAIL_RE.test(email)) {
      setNote("נראה שכתובת המייל חסרה או שגויה.");
      return;
    }
    if (topics.length === 0) {
      setNote("בחרו לפחות תחום אחד לקבלת התראות.");
      return;
    }
    if (!hasSupabaseConfig) {
      setNote("החיבור למסד הנתונים עדיין לא הוגדר.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: email.split("@")[0], topics },
      },
    });
    setSubmitting(false);
    setNote(error ? "שליחת המייל נכשלה. אפשר לנסות שוב בעוד רגע." : `מעולה. שלחנו מייל אימות ל${email} ואז ההתראות מתחילות.`);
  }

  return (
    <section className="mx-auto max-w-[1200px] px-4 pt-[60px] sm:px-[28px]">
      <div
        className="grid gap-10 rounded-[24px] p-6 sm:grid-cols-[1.1fr_0.9fr] sm:gap-[52px] sm:p-[44px_46px]"
        style={{ background: "oklch(0.24 0.012 250)", color: "oklch(0.97 0.004 240)" }}
      >
        <div>
          <h2 className="mb-3 text-[27px] font-extrabold leading-[1.15] tracking-[-0.03em] sm:text-[33px]" style={{ textWrap: "pretty" }}>
            מייל ברגע שמתפרסם קול קורא בתחומים שסימנתם.
          </h2>
          <p className="mb-6 max-w-[46ch] text-[17px] leading-[1.55]" style={{ color: "oklch(0.78 0.008 250)" }}>
            בוחרים תחומים, מקבלים התראה תוך דקות מהפרסום. בלי לעבור כל בוקר על אתרי הגופים.
          </p>
          <div className="mb-[22px] flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const active = topics.includes(t);
              return <Chip key={t} label={t} active={active} onClick={() => toggleTopic(t)} tone={chipToneDark(active)} />;
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="כתובת המייל שלך"
              className="min-w-[230px] flex-1 rounded-xl border px-[18px] py-3.5 text-base outline-none"
              style={{ borderColor: "oklch(0.4 0.012 250)", background: "oklch(0.29 0.012 250)", color: "oklch(0.98 0.003 240)" }}
            />
            <button
              type="button"
              onClick={onSubscribe}
              disabled={submitting}
              className="cursor-pointer rounded-xl border-none px-[26px] py-3.5 text-base font-extrabold disabled:opacity-60"
              style={{ background: "oklch(0.62 0.15 145)", color: "oklch(0.16 0.03 145)" }}
            >
              הפעלת התראות
            </button>
          </div>
          <div className="mt-3 min-h-[20px] text-sm" style={{ color: "oklch(0.72 0.008 250)" }}>
            {note}
          </div>
        </div>
        <div
          className="rounded-2xl p-[22px]"
          style={{ background: "oklch(0.98 0.003 240)", color: "oklch(0.24 0.012 250)", boxShadow: "0 24px 60px oklch(0.2 0.02 250 / 0.35)" }}
        >
          <div className="text-xs font-bold tracking-[0.04em]" style={{ color: "oklch(0.58 0.012 250)" }}>
            תצוגה מקדימה של המייל
          </div>
          <div className="my-3 border-t" style={{ borderColor: "oklch(0.9 0.008 250)" }} />
          <div className="mb-1 text-[13px]" style={{ color: "oklch(0.5 0.012 250)" }}>
            מאת: התראות קולאקטייב
          </div>
          <div className="mb-3.5 text-[17px] font-extrabold tracking-[-0.02em]">2 קולות קוראים חדשים בתחומים שלך</div>
          <div className="grid gap-2.5">
            {REAL.slice(0, 2).map((r) => (
              <div key={r.body} className="rounded-[10px] border p-[12px_14px]" style={{ borderColor: "oklch(0.91 0.008 250)" }}>
                <div className="mb-1 text-xs font-bold" style={{ color: "oklch(0.42 0.13 145)" }}>
                  {r.body}
                </div>
                <div className="mb-1.5 text-[15px] font-bold leading-[1.3]">{r.title}</div>
                <div className="text-[13px]" style={{ color: "oklch(0.52 0.012 250)" }}>
                  {r.kind}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3.5 text-center text-[13px] font-bold" style={{ color: "oklch(0.42 0.13 145)" }}>
            צפייה בכל הפרסומים באתר
          </div>
        </div>
      </div>
    </section>
  );
}
