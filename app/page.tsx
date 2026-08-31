import { CATS } from "@/lib/constants";
import { REAL, TOTAL_CATALOGUED_BODIES } from "@/lib/data/verified-sources";
import { getBodyIdMap } from "@/lib/data/bodies";
import { getCurrentProfile, getSavedBodyNames } from "@/lib/data/profiles";
import { FeedBoard } from "@/components/FeedBoard";
import { NotifySignup } from "@/components/NotifySignup";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ body?: string }>;
}) {
  const [profile, params] = await Promise.all([getCurrentProfile(), searchParams]);
  const [bodyIds, savedNames] = await Promise.all([
    getBodyIdMap(),
    profile ? getSavedBodyNames(profile.id) : Promise.resolve<string[]>([]),
  ]);

  const stats = [
    { value: String(REAL.length), label: "מקורות מאומתים בלוח" },
    { value: String(TOTAL_CATALOGUED_BODIES), label: "גופים במעקב הסריקה" },
    { value: "257", label: "רשויות מקומיות בישראל" },
    { value: String(CATS.length - 1), label: "תחומים מסוננים" },
  ];

  return (
    <div>
      <section className="mx-auto max-w-[1200px] px-4 pb-[34px] pt-[52px] sm:px-[28px]">
        <h1
          className="mb-4 max-w-[17ch] text-[34px] leading-[1.1] font-extrabold tracking-[-0.035em] sm:text-[48px] sm:leading-[1.06]"
          style={{ textWrap: "pretty" }}
        >
          כל הקולות הקוראים לעולם העיצוב מהגופים הציבוריים בישראל.
        </h1>
        <p
          className="mb-8 max-w-[54ch] text-lg leading-[1.55]"
          style={{ color: "oklch(0.46 0.012 250)", textWrap: "pretty" }}
        >
          קולות קוראים, מכרזים ומסגרות הסכם מכל 257 הרשויות המקומיות, משרדי הממשלה, העמותות והקרנות הציבוריות —
          מסוננים לכל עולם העיצוב: עיצוב גרפי, אנימציה, איור, UX, צילום, קופי ותוכן ועיצוב תערוכות. נאספים אוטומטית
          ונשלחים למייל ברגע שהם מתפרסמים. השימוש חינמי.
        </p>
        <div
          className="flex flex-wrap gap-8 border-t pt-6 sm:gap-[44px]"
          style={{ borderColor: "oklch(0.9 0.008 250)" }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-[31px] font-extrabold tracking-[-0.03em]">{s.value}</div>
              <div className="text-sm font-semibold" style={{ color: "oklch(0.52 0.012 250)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <FeedBoard
        sources={REAL}
        userId={profile?.id ?? null}
        bodyIds={bodyIds}
        initialSaved={savedNames}
        initialBody={params.body}
      />

      <NotifySignup />
    </div>
  );
}
