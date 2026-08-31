import { SITE_EMAIL } from "@/lib/constants";

export function Footer() {
  return (
    <footer
      className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-[18px] px-4 pb-10 pt-[54px] text-sm sm:px-[28px]"
      style={{ color: "oklch(0.55 0.012 250)" }}
    >
      <div>קולאקטייב · מאגר עצמאי וחינמי. המידע המחייב הוא זה שמופיע במסמכי ההליך אצל הגוף המפרסם.</div>
      <div className="flex gap-[18px]">
        <a href={`mailto:${SITE_EMAIL}`}>הצטרפות כגוף מפרסם</a>
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
      </div>
    </footer>
  );
}
