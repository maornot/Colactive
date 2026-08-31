import Link from "next/link";
import { DIRECTORY, HUBS, docsFor, isVerified } from "@/lib/data/verified-sources";
import { getApprovedCountsByBodyName } from "@/lib/data/tenders";
import { verifiedBadgeTone } from "@/lib/design";
import { ExternalLink } from "@/components/ExternalLink";

export default async function BodiesPage() {
  const openCounts = await getApprovedCountsByBodyName();

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-[46px] sm:px-[28px]">
      <h1 className="mb-2 text-[32px] font-extrabold tracking-[-0.03em] sm:text-[38px]">גופים מפרסמים</h1>
      <p className="mb-8 max-w-[62ch] text-[17px]" style={{ color: "oklch(0.5 0.012 250)", textWrap: "pretty" }}>
        רשויות מקומיות, משרדי ממשלה, עמותות וקרנות ציבוריות. הסריקה מסננת רק פרסומים מעולם העיצוב — גרפי, אנימציה,
        איור, UX, צילום, קופי ותוכן ועיצוב תערוכות. &quot;מקור מאומת&quot; פירושו שהקישור נבדק מול אתר הגוף; ביתר
        המקרים הקישור מוביל לחיפוש ממוקד בפרסומי אותו גוף.
      </p>

      <div className="mb-8 rounded-[20px] p-6 sm:p-[28px_30px]" style={{ background: "oklch(0.24 0.012 250)", color: "oklch(0.97 0.004 240)" }}>
        <div className="mb-1.5 text-xl font-extrabold tracking-[-0.02em]">מקורות מרכזיים</div>
        <div className="mb-5 text-[15px]" style={{ color: "oklch(0.78 0.008 250)" }}>
          שם מתפרסם הרוב. כל אחד מהם נבדק מול המקור.
        </div>
        <div className="grid gap-2.5">
          {HUBS.map((h) => (
            <ExternalLink
              key={h.name}
              href={h.url}
              className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border p-[15px_18px]"
              style={{ borderColor: "oklch(0.4 0.012 250)", color: "inherit" }}
            >
              <span>
                <span className="block text-base font-bold">{h.name}</span>
                <span className="mt-[3px] block text-sm" style={{ color: "oklch(0.76 0.008 250)" }}>
                  {h.note}
                </span>
              </span>
              <span className="whitespace-nowrap text-sm font-extrabold" style={{ color: "oklch(0.75 0.1 145)" }}>
                פתיחה ↗
              </span>
            </ExternalLink>
          ))}
        </div>
      </div>

      <div className="grid gap-[30px]">
        {DIRECTORY.map((group) => (
          <div key={group.group}>
            <div className="mb-3.5 flex items-baseline gap-3 border-b pb-2.5" style={{ borderColor: "oklch(0.9 0.008 250)" }}>
              <div className="text-xl font-extrabold tracking-[-0.02em]">{group.group}</div>
              <div className="text-sm font-semibold" style={{ color: "oklch(0.55 0.012 250)" }}>
                {group.items.length} גופים
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {group.items.map((item) => {
                const verified = isVerified(item.name);
                const tone = verifiedBadgeTone(verified);
                const url = docsFor(item.name);
                const openCount = openCounts[item.name] ?? 0;
                return (
                  <div
                    key={item.name}
                    className="grid grid-cols-[1fr_auto] items-center gap-3.5 rounded-2xl border p-[16px_18px]"
                    style={{ background: "oklch(0.99 0.003 240)", borderColor: "oklch(0.91 0.008 250)" }}
                  >
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold leading-[1.3]">{item.name}</span>
                        <span
                          className="rounded-full px-[9px] py-[3px] text-xs font-extrabold"
                          style={{ background: tone.bg, color: tone.color }}
                        >
                          {verified ? item.via || "מקור מאומת" : "חיפוש בפרסומי הגוף"}
                        </span>
                      </div>
                      <div className="text-[13px] font-semibold" style={{ color: "oklch(0.52 0.012 250)" }}>
                        {openCount > 0
                          ? openCount === 1
                            ? "הליך פתוח אחד בקולאקטייב"
                            : `${openCount} הליכים פתוחים בקולאקטייב`
                          : "אין הליכים פתוחים כרגע"}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {openCount > 0 && (
                        <Link
                          href={`/?body=${encodeURIComponent(item.name)}`}
                          className="whitespace-nowrap rounded-[9px] border px-[13px] py-2 text-[13px] font-bold"
                          style={{ borderColor: "oklch(0.89 0.008 250)", color: "oklch(0.35 0.012 250)" }}
                        >
                          בלוח
                        </Link>
                      )}
                      <ExternalLink
                        href={url}
                        className="whitespace-nowrap rounded-[9px] border px-[13px] py-2 text-[13px] font-bold"
                        style={{ borderColor: "oklch(0.89 0.008 250)", color: "oklch(0.35 0.012 250)" }}
                      >
                        מקור ↗
                      </ExternalLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 max-w-[70ch] text-sm" style={{ color: "oklch(0.55 0.012 250)", textWrap: "pretty" }}>
        בישראל 257 רשויות מקומיות. הרשימה כאן מציגה את הגופים שמפרסמים באופן קבוע בתחומי העיצוב, האנימציה, הצילום
        והקופי; הסריקה עצמה מכסה את כלל הרשויות דרך אתריהן ולוחות המכרזים העירוניים.
      </div>
    </div>
  );
}
