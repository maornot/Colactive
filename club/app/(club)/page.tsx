import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/brand";
import { getGalleryImages } from "@/lib/gallery";
import { getListState } from "@/lib/current-list";
import { Countdown } from "@/components/Countdown";

export default async function HomePage() {
  const [state, images] = await Promise.all([getListState(), getGalleryImages()]);

  return (
    <>
      <section className="grain">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <p className="mb-5 text-sm font-medium tracking-[0.2em] text-amber">מועדון פרטי · תל אביב</p>
          <h1 className="max-w-[14ch] font-display text-5xl font-black leading-[1.05] sm:text-7xl">
            {brand.tagline}
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-cream-2">{brand.intro}</p>

          <div className="mt-10">
            {state?.open ? (
              <Link
                href="/list"
                className="inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-amber/50 bg-amber/10 px-5 py-4 hover:bg-amber/15"
              >
                <span className="flex items-center gap-2 font-bold text-amber">
                  <span className="size-2 animate-pulse rounded-full bg-amber" />
                  הרשימה פתוחה: {state.list.title}
                </span>
                <span className="text-cream-2">
                  נשארו {state.list.capacity - state.count} מקומות · נסגרת בעוד <Countdown until={state.list.closesAt} />
                </span>
              </Link>
            ) : (
              <Link href="/list" className="btn btn-ghost">
                הרשימה כרגע סגורה
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-px overflow-hidden px-4 sm:grid-cols-3 sm:px-6">
        {brand.pillars.map((p, i) => (
          <div key={p.title} className="border-t border-line py-8 sm:pe-8">
            <span className="text-sm text-cream-3">0{i + 1}</span>
            <h2 className="mt-2 font-display text-3xl font-bold">{p.title}</h2>
            <p className="mt-3 leading-relaxed text-cream-2">{p.text}</p>
          </div>
        ))}
      </section>

      {images.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold">מהערבים האחרונים</h2>
            <Link href="/gallery" className="text-sm text-amber hover:text-cream">
              לכל הגלריה ←
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.slice(0, 4).map((src) => (
              <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-night-2">
                <Image src={src} alt="" fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
