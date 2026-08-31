import Link from "next/link";
import { getCurrentProfile, getSavedBodyNames } from "@/lib/data/profiles";
import { getMonthlyNotificationCount } from "@/lib/data/notifications";
import { getBodyIdMap } from "@/lib/data/bodies";
import { REAL } from "@/lib/data/verified-sources";
import { MePanel } from "@/components/MePanel";

export default async function MePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 pt-[46px] sm:px-[28px]">
        <h1 className="mb-2 text-[32px] font-extrabold tracking-[-0.03em] sm:text-[38px]">האזור האישי</h1>
        <p className="mb-6 text-[17px]" style={{ color: "oklch(0.5 0.012 250)" }}>
          צריך להתחבר כדי לראות את המקורות במעקב ואת הגדרות ההתראות.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full border-none px-5 py-2.5 text-sm font-bold"
          style={{ background: "oklch(0.24 0.012 250)", color: "oklch(0.98 0.003 240)" }}
        >
          לדף הראשי
        </Link>
      </div>
    );
  }

  const [savedNames, monthlyNotifications, bodyIds] = await Promise.all([
    getSavedBodyNames(profile.id),
    getMonthlyNotificationCount(profile.id),
    getBodyIdMap(),
  ]);

  return (
    <MePanel
      profile={profile}
      sources={REAL}
      initialSaved={savedNames}
      bodyIds={bodyIds}
      monthlyNotifications={monthlyNotifications}
    />
  );
}
