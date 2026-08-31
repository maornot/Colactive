"use client";

import { useState } from "react";
import { DEFAULT_PREFS, PREF_ROWS, TOPICS } from "@/lib/constants";
import { chipToneLight } from "@/lib/design";
import type { VerifiedSource } from "@/lib/data/verified-sources";
import { useSavedSources } from "@/lib/hooks/useSavedSources";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { Chip } from "./Chip";
import { Toggle } from "./Toggle";
import { ExternalLink } from "./ExternalLink";

const EMAIL_RE = /.+@.+\..+/;

interface MePanelProps {
  profile: Profile;
  sources: VerifiedSource[];
  initialSaved: string[];
  bodyIds: Record<string, string>;
  monthlyNotifications: number;
}

export function MePanel({ profile, sources, initialSaved, bodyIds, monthlyNotifications }: MePanelProps) {
  const { saved, toggle } = useSavedSources(profile.id, initialSaved, bodyIds);
  const [emailDraft, setEmailDraft] = useState(profile.email);
  const [emailNote, setEmailNote] = useState("");
  const [topics, setTopics] = useState<string[]>(profile.topics.length ? profile.topics : []);
  const [prefs, setPrefs] = useState(profile.prefs ?? DEFAULT_PREFS);

  const savedSources = sources.filter((r) => saved.includes(r.body));

  async function saveEmail() {
    if (!EMAIL_RE.test(emailDraft)) {
      setEmailNote("כתובת המייל שגויה.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: emailDraft });
    setEmailNote(
      error ? "עדכון הכתובת נכשל. אפשר לנסות שוב בעוד רגע." : `שלחנו מייל אימות ל${emailDraft}. ההתראות יעברו לשם ברגע שתאמתו.`
    );
  }

  async function toggleTopic(t: string) {
    const next = topics.includes(t) ? topics.filter((x) => x !== t) : topics.concat(t);
    setTopics(next);
    const supabase = createClient();
    await supabase.from("profiles").update({ topics: next }).eq("id", profile.id);
  }

  async function togglePref(key: keyof typeof prefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    const supabase = createClient();
    await supabase.from("profiles").update({ prefs: next }).eq("id", profile.id);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-[46px] sm:px-[28px]">
      <h1 className="mb-2 text-[32px] font-extrabold tracking-[-0.03em] sm:text-[38px]">האזור האישי</h1>
      <p className="mb-8 text-[17px]" style={{ color: "oklch(0.5 0.012 250)" }}>
        מה שסימנתם למעקב, מה שהגשתם, ואיך ההתראות מוגדרות.
      </p>

      <div className="grid items-start gap-[22px] lg:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-[22px]">
          <div className="rounded-[18px] border p-5 sm:p-[22px_24px]" style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}>
            <div className="mb-4 flex items-baseline justify-between">
              <div className="text-[19px] font-extrabold tracking-[-0.02em]">במעקב שלי</div>
              <div className="text-sm font-semibold" style={{ color: "oklch(0.55 0.012 250)" }}>
                {saved.length} מקורות
              </div>
            </div>
            <div className="grid gap-2.5">
              {savedSources.map((item) => (
                <div
                  key={item.body}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border p-[15px_17px]"
                  style={{ borderColor: "oklch(0.92 0.008 250)" }}
                >
                  <div>
                    <div className="mb-[3px] text-[13px] font-bold" style={{ color: "oklch(0.42 0.13 145)" }}>
                      {item.body} · {item.kind}
                    </div>
                    <div className="text-base font-bold leading-[1.3]">{item.title}</div>
                  </div>
                  <div className="flex gap-2">
                    <ExternalLink
                      href={item.url}
                      className="whitespace-nowrap rounded-[9px] border px-3.5 py-2.5 text-[13px] font-bold"
                      style={{ borderColor: "oklch(0.89 0.008 250)", color: "oklch(0.35 0.012 250)" }}
                    >
                      לעמוד ↗
                    </ExternalLink>
                    <button
                      type="button"
                      onClick={() => toggle(item.body)}
                      className="cursor-pointer whitespace-nowrap rounded-[9px] border bg-transparent px-3 py-2.5 text-[13px] font-bold"
                      style={{ borderColor: "oklch(0.89 0.008 250)", color: "oklch(0.5 0.012 250)" }}
                    >
                      הסרה
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {saved.length === 0 && (
              <div className="py-3.5 text-[15px]" style={{ color: "oklch(0.55 0.012 250)" }}>
                עדיין לא סימנתם מקורות למעקב. בלוח, לחצו &quot;הוספה למעקב&quot; על מקור שמעניין אתכם.
              </div>
            )}
          </div>

          <div className="rounded-[18px] border p-5 sm:p-[22px_24px]" style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}>
            <div className="mb-1.5 text-[19px] font-extrabold tracking-[-0.02em]">ההתראות שלי</div>
            <div className="mb-[18px] text-[15px]" style={{ color: "oklch(0.52 0.012 250)" }}>
              מייל נשלח מיד עם פרסום, בתחומים שסימנתם.
            </div>
            <div className="mb-5 rounded-xl border p-4" style={{ background: "oklch(0.965 0.005 250)", borderColor: "oklch(0.92 0.008 250)" }}>
              <div className="mb-2 text-sm font-bold">כתובת המייל לקבלת התראות</div>
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  value={emailDraft}
                  onChange={(e) => {
                    setEmailDraft(e.target.value);
                    setEmailNote("");
                  }}
                  placeholder="name@studio.co.il"
                  className="min-w-[220px] flex-1 rounded-[10px] border px-[15px] py-2.5 text-[15px] outline-none"
                  style={{ borderColor: "oklch(0.89 0.008 250)", background: "oklch(0.99 0.003 240)" }}
                />
                <button
                  type="button"
                  onClick={saveEmail}
                  className="cursor-pointer rounded-[10px] border-none px-5 py-2.5 text-sm font-bold"
                  style={{ background: "oklch(0.24 0.012 250)", color: "oklch(0.98 0.003 240)" }}
                >
                  עדכון כתובת
                </button>
              </div>
              <div className="mt-2.5 min-h-[18px] text-[13px]" style={{ color: "oklch(0.52 0.012 250)" }}>
                {emailNote}
              </div>
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {TOPICS.map((t) => {
                const active = topics.includes(t);
                return <Chip key={t} label={t} active={active} onClick={() => toggleTopic(t)} tone={chipToneLight(active)} />;
              })}
            </div>
            <div className="grid gap-2.5">
              {PREF_ROWS.map((p) => (
                <div key={p.key} className="flex items-center justify-between border-t pt-3" style={{ borderColor: "oklch(0.93 0.008 250)" }}>
                  <div>
                    <div className="text-[15px] font-bold">{p.label}</div>
                    <div className="text-[13px]" style={{ color: "oklch(0.55 0.012 250)" }}>
                      {p.note}
                    </div>
                  </div>
                  <Toggle on={prefs[p.key]} onToggle={() => togglePref(p.key)} label={p.label} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-[22px]">
          <div className="rounded-[18px] p-5 sm:p-[22px_24px]" style={{ background: "oklch(0.24 0.012 250)", color: "oklch(0.97 0.004 240)" }}>
            <div className="mb-3.5 text-sm font-bold" style={{ color: "oklch(0.75 0.03 145)" }}>
              החודש שלי
            </div>
            <div className="grid gap-3.5">
              <div>
                <div className="text-[27px] font-extrabold tracking-[-0.03em]">{saved.length}</div>
                <div className="text-sm font-semibold" style={{ color: "oklch(0.78 0.008 250)" }}>
                  מקורות במעקב
                </div>
              </div>
              <div>
                <div className="text-[27px] font-extrabold tracking-[-0.03em]">{monthlyNotifications}</div>
                <div className="text-sm font-semibold" style={{ color: "oklch(0.78 0.008 250)" }}>
                  התראות שקיבלתם החודש
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[18px] border p-5 sm:p-[22px_24px]" style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}>
            <div className="mb-2.5 text-base font-extrabold">איך נקבע מה נשלח</div>
            <div className="text-sm leading-[1.6]" style={{ color: "oklch(0.45 0.012 250)", textWrap: "pretty" }}>
              הסריקה עוברת על עמודי המכרזים והקולות הקוראים של הגופים, מסננת לפי התחומים שסימנתם, ושולחת מייל עם
              קישור ישר לפרסום באתר הגוף. הנתון המחייב הוא זה שבמסמכי ההליך.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
