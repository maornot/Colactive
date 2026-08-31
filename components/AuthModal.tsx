"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "./AuthModalProvider";
import { Chip } from "./Chip";
import { Toggle } from "./Toggle";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { DEFAULT_PREFS, PREF_ROWS, ROLES, TOPICS } from "@/lib/constants";
import { chipToneLight } from "@/lib/design";

type Step = "details" | "topics" | "done";

const EMAIL_RE = /.+@.+\..+/;

export function AuthModal() {
  const { mode, close } = useAuthModal();
  if (!mode) return null;
  // Remounting on mode change resets every field below for free — no reset effect needed.
  return <AuthModalDialog key={mode} mode={mode} close={close} />;
}

function AuthModalDialog({ mode, close }: { mode: "signup" | "login"; close: () => void }) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [topics, setTopics] = useState<string[]>(["עיצוב גרפי", "אנימציה ומושן"]);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  const isLogin = mode === "login";

  async function sendMagicLink() {
    if (!hasSupabaseConfig) {
      setError("החיבור למסד הנתונים עדיין לא הוגדר.");
      return;
    }
    setSubmitting(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: !isLogin,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: isLogin ? undefined : { full_name: name.trim(), role, topics, prefs },
      },
    });
    setSubmitting(false);
    if (authError) {
      if (/not.*found|signup/i.test(authError.message)) {
        setError("לא נמצא חשבון עם כתובת המייל הזו. אפשר להירשם במקום.");
      } else {
        setError("שליחת הקישור נכשלה. אפשר לנסות שוב בעוד רגע.");
      }
      return;
    }
    setStep("done");
  }

  function onNext() {
    if (!EMAIL_RE.test(email)) {
      setError("כתובת המייל חסרה או שגויה.");
      return;
    }
    if (isLogin) {
      void sendMagicLink();
      return;
    }
    if (!name.trim()) {
      setError("צריך למלא שם מלא.");
      return;
    }
    setError("");
    setStep("topics");
  }

  function onFinish() {
    if (topics.length === 0) {
      setError("בחרו לפחות תחום אחד.");
      return;
    }
    void sendMagicLink();
  }

  function toggleTopic(t: string) {
    setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : cur.concat(t)));
    setError("");
  }

  function togglePref(key: keyof typeof prefs) {
    setPrefs((cur) => ({ ...cur, [key]: !cur[key] }));
  }

  const title = isLogin
    ? "כניסה לחשבון"
    : step === "topics"
      ? "מה לשלוח לך?"
      : step === "done"
        ? "כמעט שם"
        : "הרשמה לקולאקטייב";

  const subtitle = isLogin
    ? "נשלח קישור כניסה חד-פעמי למייל שאיתו נרשמת."
    : step === "topics"
      ? "בחרו תחומים. התראה תישלח רק על פרסומים שתואמים להם."
      : step === "done"
        ? "נשאר רק לאמת את המייל."
        : "חינם, בלי סיסמה, בלי התחייבות.";

  function handleClose() {
    close();
    if (step === "done") router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 pt-[52px] pb-10" onClick={handleClose}>
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] rounded-[20px] border p-[26px] sm:p-[34px]"
        style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-extrabold tracking-tight">{title}</div>
            <div className="mt-[5px] text-[15px]" style={{ color: "oklch(0.5 0.012 250)" }}>
              {subtitle}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="סגירה"
            className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-lg border text-base"
            style={{ borderColor: "oklch(0.89 0.008 250)", color: "oklch(0.45 0.012 250)" }}
          >
            ×
          </button>
        </div>

        {step === "details" && (
          <div className="grid gap-3.5">
            {!isLogin && (
              <div>
                <div className="mb-1.5 text-sm font-bold">שם מלא</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="שם ושם משפחה"
                  className="w-full rounded-[10px] border px-[15px] py-3 text-[15px] outline-none"
                  style={{ borderColor: "oklch(0.89 0.008 250)", background: "oklch(0.975 0.004 240)" }}
                />
              </div>
            )}
            <div>
              <div className="mb-1.5 text-sm font-bold">כתובת מייל לקבלת ההתראות</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@studio.co.il"
                className="w-full rounded-[10px] border px-[15px] py-3 text-[15px] outline-none"
                style={{ borderColor: "oklch(0.89 0.008 250)", background: "oklch(0.975 0.004 240)" }}
              />
            </div>
            {!isLogin && (
              <div>
                <div className="mb-1.5 text-sm font-bold">התחום שלי</div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-[10px] border px-[15px] py-3 text-[15px] font-semibold"
                  style={{ borderColor: "oklch(0.89 0.008 250)", background: "oklch(0.975 0.004 240)" }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="text-[13px] leading-relaxed" style={{ color: "oklch(0.55 0.012 250)" }}>
              אין סיסמה. אחרי ההרשמה נשלח קישור כניסה למייל, וכל כניסה נוספת נעשית באותה דרך.
            </div>
            <div className="min-h-[20px] text-sm font-semibold" style={{ color: "oklch(0.44 0.14 30)" }}>
              {error}
            </div>
            <button
              type="button"
              onClick={onNext}
              disabled={submitting}
              className="cursor-pointer rounded-xl border-none px-6 py-[14px] text-base font-extrabold disabled:opacity-60"
              style={{ background: "oklch(0.24 0.012 250)", color: "oklch(0.98 0.003 240)" }}
            >
              {isLogin ? "שליחת קישור כניסה" : "המשך לבחירת תחומים"}
            </button>
          </div>
        )}

        {step === "topics" && !isLogin && (
          <div>
            <div className="mb-[22px] flex flex-wrap gap-2">
              {TOPICS.map((t) => {
                const active = topics.includes(t);
                return <Chip key={t} label={t} active={active} onClick={() => toggleTopic(t)} tone={chipToneLight(active)} />;
              })}
            </div>
            <div className="mb-5 grid gap-3 border-t pt-[18px]" style={{ borderColor: "oklch(0.92 0.008 250)" }}>
              {PREF_ROWS.map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-4">
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
            <div className="mb-2 min-h-[20px] text-sm font-semibold" style={{ color: "oklch(0.44 0.14 30)" }}>
              {error}
            </div>
            <button
              type="button"
              onClick={onFinish}
              disabled={submitting}
              className="w-full cursor-pointer rounded-xl border-none px-6 py-[14px] text-base font-extrabold disabled:opacity-60"
              style={{ background: "oklch(0.62 0.15 145)", color: "oklch(0.16 0.03 145)" }}
            >
              סיום הרשמה
            </button>
          </div>
        )}

        {step === "done" && (
          <div>
            <div className="mb-5 rounded-[14px] p-5" style={{ background: "oklch(0.955 0.03 145)" }}>
              <div className="mb-1.5 text-base font-extrabold" style={{ color: "oklch(0.34 0.12 145)" }}>
                שלחנו קישור אימות ל{email}
              </div>
              <div className="text-sm leading-relaxed" style={{ color: "oklch(0.38 0.06 145)" }}>
                לחיצה על הקישור מפעילה את ההתראות. אם המייל לא מגיע תוך כמה דקות, כדאי לבדוק בתיקיית הספאם.
              </div>
            </div>
            {!isLogin && (
              <div className="mb-5 text-[15px] leading-relaxed" style={{ color: "oklch(0.42 0.012 250)" }}>
                בחרתם {topics.length} תחומים. אפשר לשנות אותם בכל רגע באזור האישי.
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="w-full cursor-pointer rounded-xl border-none px-6 py-[14px] text-base font-extrabold"
              style={{ background: "oklch(0.24 0.012 250)", color: "oklch(0.98 0.003 240)" }}
            >
              לאזור האישי
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
