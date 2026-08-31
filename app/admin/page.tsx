import { getCurrentProfile, getAllProfiles } from "@/lib/data/profiles";
import { getPendingTenders, getAdminStats } from "@/lib/data/tenders";
import { getScanSources } from "@/lib/data/bodies";
import { sourceStatusTone } from "@/lib/design";
import { AdminQueue } from "@/components/AdminQueue";
import { MembersTable } from "@/components/MembersTable";

function formatScanTime(iso: string | null): string {
  if (!iso) return "טרם נסרק";
  return new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem" }).format(
    new Date(iso)
  );
}

export default async function AdminPage() {
  const profile = await getCurrentProfile();

  if (!profile?.is_admin) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 pt-[46px] sm:px-[28px]">
        <h1 className="mb-2 text-[32px] font-extrabold tracking-[-0.03em] sm:text-[38px]">לוח ניהול</h1>
        <p className="text-[17px]" style={{ color: "oklch(0.5 0.012 250)" }}>
          {profile ? "לחשבון הזה אין הרשאת ניהול." : "צריך להתחבר עם חשבון בעל הרשאת ניהול כדי לצפות בעמוד זה."}
        </p>
      </div>
    );
  }

  const [pending, sources, members, stats] = await Promise.all([
    getPendingTenders(),
    getScanSources(),
    getAllProfiles(),
    getAdminStats(),
  ]);

  const adminStats = [
    { value: String(stats.activeBodies), label: "מקורות פעילים" },
    { value: `${stats.handledCount} / ${stats.totalTenders}`, label: "טופלו מתוך כלל הפרסומים שנסרקו" },
    { value: String(stats.memberCount), label: "נרשמים להתראות" },
    { value: stats.emailDeliveryRate === null ? "—" : `${stats.emailDeliveryRate}%`, label: "אחוז מיילים שנשלחו בהצלחה" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-[46px] sm:px-[28px]">
      <h1 className="mb-2 text-[32px] font-extrabold tracking-[-0.03em] sm:text-[38px]">לוח ניהול</h1>
      <p className="mb-7 text-[17px]" style={{ color: "oklch(0.5 0.012 250)" }}>
        מקורות סריקה, פרסומים שממתינים לאישור ומצב שליחת ההתראות.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {adminStats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border p-4 sm:p-[18px_20px]"
            style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}
          >
            <div className="text-[26px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{s.value}</div>
            <div className="text-sm font-semibold" style={{ color: "oklch(0.52 0.012 250)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <AdminQueue items={pending} />

      <MembersTable members={members} />

      <div
        className="rounded-[18px] border p-5 sm:p-[22px_24px]"
        style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}
      >
        <div className="mb-4 text-[19px] font-extrabold tracking-[-0.02em]">מקורות סריקה</div>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div
              className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr] gap-3 border-b pb-2.5 text-[13px] font-bold"
              style={{ borderColor: "oklch(0.92 0.008 250)", color: "oklch(0.55 0.012 250)" }}
            >
              <div>גוף מפרסם</div>
              <div>סריקה אחרונה</div>
              <div>פרסומים ב-30 יום</div>
              <div>מצב</div>
            </div>
            {sources.map((s) => {
              const tone = sourceStatusTone(s.lastStatus === "ok" ? "תקין" : s.lastStatus === "slow" ? "איטי" : "תקלה");
              const statusLabel = s.lastStatus === "ok" ? "תקין" : s.lastStatus === "slow" ? "איטי" : "תקלה";
              return (
                <div
                  key={s.body}
                  className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr] items-center gap-3 border-b py-3.5 text-[15px]"
                  style={{ borderColor: "oklch(0.94 0.008 250)" }}
                >
                  <div className="font-bold">{s.body}</div>
                  <div style={{ color: "oklch(0.5 0.012 250)" }}>{formatScanTime(s.lastScanAt)}</div>
                  <div style={{ color: "oklch(0.5 0.012 250)" }}>{s.count30d}</div>
                  <div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[13px] font-extrabold"
                      style={{ background: tone.bg, color: tone.color }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
            {sources.length === 0 && (
              <div className="py-3.5 text-[15px]" style={{ color: "oklch(0.55 0.012 250)" }}>
                אין עדיין מקורות מחוברים לסריקה.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
