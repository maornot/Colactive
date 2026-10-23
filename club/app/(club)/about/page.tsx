import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata = { title: "המותג" };

export default function AboutPage() {
  return (
    <div className="grain">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="mb-4 text-sm font-medium tracking-[0.2em] text-amber">המותג</p>
        <h1 className="font-display text-4xl font-black leading-tight sm:text-6xl">
          {brand.hebrewName}. <span className="text-cream-2">{brand.tagline}</span>
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-cream-2">
          {brand.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <h2 className="mt-16 font-display text-3xl font-bold">חוקי הבית</h2>
        <ol className="mt-6 space-y-4">
          {brand.rules.map((rule, i) => (
            <li key={rule} className="flex gap-4 border-t border-line pt-4">
              <span className="font-display text-2xl text-amber">{i + 1}</span>
              <span className="pt-1 text-cream-2">{rule}</span>
            </li>
          ))}
        </ol>

        <Link href="/list" className="btn mt-14">
          לרשימה הבאה
        </Link>
      </div>
    </div>
  );
}
