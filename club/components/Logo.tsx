import { brand } from "@/lib/brand";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      dir="ltr"
      className={`inline-block font-display font-black tracking-[0.18em] text-cream ${size === "lg" ? "text-4xl sm:text-5xl" : "text-lg"}`}
    >
      {brand.name}
      <span className="text-amber">.</span>
    </span>
  );
}
