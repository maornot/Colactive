import { getGalleryImages } from "@/lib/gallery";
import { Gallery } from "@/components/Gallery";

export const metadata = { title: "גלריה" };

export default async function GalleryPage() {
  const images = await getGalleryImages();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="mb-4 text-sm font-medium tracking-[0.2em] text-amber">גלריה</p>
      <h1 className="mb-10 font-display text-4xl font-black sm:text-6xl">מה שקרה בערבים.</h1>
      {images.length ? <Gallery images={images} /> : <p className="text-cream-2">עוד אין תמונות.</p>}
    </div>
  );
}
