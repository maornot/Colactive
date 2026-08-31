import type { Tender } from "@/lib/types";

export type TenderWithBodyName = Omit<Tender, "body"> & { bodyName: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://collactive.co.il";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jerusalem" }).format(
    new Date(iso)
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function renderInstantNotificationEmail(tenders: TenderWithBodyName[]): { subject: string; html: string } {
  const subject =
    tenders.length === 1
      ? `קול קורא חדש: ${tenders[0].title}`
      : `${tenders.length} קולות קוראים חדשים בתחומים שלך`;

  const rows = tenders
    .map(
      (t) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e5e5e5">
          <div style="font-size:12px;font-weight:700;color:#2f7a4f;margin-bottom:4px">${escapeHtml(t.bodyName)}</div>
          <div style="font-size:16px;font-weight:700;line-height:1.35;margin-bottom:6px">
            <a href="${t.docs_url}" style="color:#1f2430;text-decoration:none">${escapeHtml(t.title)}</a>
          </div>
          <div style="font-size:13px;color:#666">
            ${escapeHtml(t.procedure_type ?? "")}${t.deadline_at ? " · מועד אחרון להגשה: " + formatDate(t.deadline_at) : ""}
          </div>
        </td>
      </tr>`
    )
    .join("");

  const html = `
  <div dir="rtl" style="font-family:Assistant,Arial,sans-serif;background:#f7f6f2;padding:32px 16px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5">
      <div style="background:#1f2430;color:#f5f5f0;padding:24px 28px">
        <div style="font-size:20px;font-weight:800">קולאקטייב</div>
        <div style="font-size:14px;color:#c7cbd6;margin-top:4px">${subject}</div>
      </div>
      <div style="padding:8px 28px 28px">
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <a href="${SITE_URL}" style="display:inline-block;margin-top:20px;background:#1f2430;color:#f5f5f0;padding:12px 20px;border-radius:10px;font-weight:700;text-decoration:none">
          צפייה בכל הפרסומים באתר
        </a>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #eee;font-size:12px;color:#888;line-height:1.6">
        קולאקטייב · מאגר עצמאי וחינמי. המידע המחייב הוא זה שמופיע במסמכי ההליך אצל הגוף המפרסם.
        <br />
        <a href="${SITE_URL}/me" style="color:#888">ניהול הגדרות ההתראות</a>
      </div>
    </div>
  </div>`;

  return { subject, html };
}

export function renderClosingReminderEmail(tender: TenderWithBodyName): { subject: string; html: string } {
  const subject = `נותרו ימים אחדים להגשה: ${tender.title}`;
  const html = `
  <div dir="rtl" style="font-family:Assistant,Arial,sans-serif;background:#f7f6f2;padding:32px 16px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5">
      <div style="background:#1f2430;color:#f5f5f0;padding:24px 28px">
        <div style="font-size:20px;font-weight:800">קולאקטייב</div>
        <div style="font-size:14px;color:#c7cbd6;margin-top:4px">תזכורת — נותרו שלושה ימים להגשה</div>
      </div>
      <div style="padding:20px 28px 28px">
        <div style="font-size:12px;font-weight:700;color:#2f7a4f;margin-bottom:4px">${escapeHtml(tender.bodyName)}</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:10px">${escapeHtml(tender.title)}</div>
        ${tender.deadline_at ? `<div style="font-size:14px;color:#666;margin-bottom:16px">מועד אחרון להגשה: ${formatDate(tender.deadline_at)}</div>` : ""}
        <a href="${tender.docs_url}" style="display:inline-block;background:#1f2430;color:#f5f5f0;padding:12px 20px;border-radius:10px;font-weight:700;text-decoration:none">
          מסמכי ההליך באתר הגוף ↗
        </a>
      </div>
    </div>
  </div>`;
  return { subject, html };
}

export function renderWeeklyDigestEmail(tenders: TenderWithBodyName[]): { subject: string; html: string } {
  const subject = `הסיכום השבועי שלכם — ${tenders.length} פרסומים בתחומים שלכם`;
  const rows = tenders
    .map(
      (t) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e5">
          <div style="font-size:12px;font-weight:700;color:#2f7a4f">${escapeHtml(t.bodyName)}</div>
          <a href="${t.docs_url}" style="font-size:15px;font-weight:700;color:#1f2430;text-decoration:none">${escapeHtml(t.title)}</a>
        </td>
      </tr>`
    )
    .join("");

  const html = `
  <div dir="rtl" style="font-family:Assistant,Arial,sans-serif;background:#f7f6f2;padding:32px 16px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5">
      <div style="background:#1f2430;color:#f5f5f0;padding:24px 28px">
        <div style="font-size:20px;font-weight:800">קולאקטייב</div>
        <div style="font-size:14px;color:#c7cbd6;margin-top:4px">הסיכום השבועי שלכם</div>
      </div>
      <div style="padding:8px 28px 28px">
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <a href="${SITE_URL}" style="display:inline-block;margin-top:20px;background:#1f2430;color:#f5f5f0;padding:12px 20px;border-radius:10px;font-weight:700;text-decoration:none">
          צפייה בכל הפרסומים באתר
        </a>
      </div>
    </div>
  </div>`;
  return { subject, html };
}
