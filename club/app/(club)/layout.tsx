import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Nav } from "@/components/Nav";
import { signOut } from "@/app/actions";
import { brand } from "@/lib/brand";

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line/60 bg-night/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="דף הבית">
            <Logo />
          </Link>
          <Nav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-cream-3 sm:px-6">
          <span>
            {brand.hebrewName} · מועדון פרטי · שתו באחריות, מגיל 18 בלבד
          </span>
          <form action={signOut}>
            <button className="hover:text-cream">יציאה</button>
          </form>
        </div>
      </footer>
    </div>
  );
}
