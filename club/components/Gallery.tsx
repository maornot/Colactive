"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export function Gallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      // RTL: the left arrow moves forward.
      if (e.key === "ArrowLeft") step(1);
      if (e.key === "ArrowRight") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setOpen(i)}
            className="block w-full overflow-hidden rounded-xl bg-night-2 transition-opacity hover:opacity-85"
            aria-label={`תמונה ${i + 1}`}
          >
            <Image src={src} alt="" width={800} height={i % 3 === 1 ? 1000 : 1200} sizes="(min-width: 640px) 33vw, 50vw" className="h-auto w-full" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(null)}
        >
          <div className="relative h-full max-h-[88dvh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[open]} alt="" fill sizes="100vw" className="object-contain" />
          </div>
          <button onClick={() => setOpen(null)} className="absolute top-4 left-4 text-3xl text-cream" aria-label="סגירה">
            ×
          </button>
          <button
            onClick={(e) => (e.stopPropagation(), step(-1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-4xl text-cream/70 hover:text-cream"
            aria-label="הקודמת"
          >
            ›
          </button>
          <button
            onClick={(e) => (e.stopPropagation(), step(1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 text-4xl text-cream/70 hover:text-cream"
            aria-label="הבאה"
          >
            ‹
          </button>
        </div>
      )}
    </>
  );
}
