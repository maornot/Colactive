"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "בית" },
  { href: "/list", label: "הרשימה" },
  { href: "/gallery", label: "גלריה" },
  { href: "/about", label: "המותג" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex w-full gap-1 overflow-x-auto text-sm sm:mx-0 sm:w-auto sm:gap-2">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors ${
              active ? "bg-cream text-night" : "text-cream-2 hover:text-cream"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
