import { promises as fs } from "fs";
import path from "path";

const IMAGE = /\.(jpe?g|png|webp|avif|gif|svg)$/i;

/** Every image in public/gallery, in filename order. Drop photos in that folder to update the gallery. */
export async function getGalleryImages() {
  const dir = path.join(process.cwd(), "public", "gallery");
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  return files
    .filter((f) => IMAGE.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => `/gallery/${encodeURIComponent(f)}`);
}
