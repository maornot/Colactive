"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Profile } from "@/lib/types";
import { useAuthModal } from "./AuthModalProvider";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/env";

const TABS = [
  { href: "/", label: "לוח קולות קוראים" },
  { href: "/sources", label: "גופים מפרסמים" },
  { href: "/me", label: "האזור האישי" },
  { href: "/admin", label: "ניהול" },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export function Header({ profile, lastScanLabel }: { profile: Profile | null; lastScanLabel: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { openSignup, openLogin } = useAuthModal();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    if (!hasSupabaseConfig) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-20 border-b"
      style={{
        background: "oklch(0.99 0.003 240 / 0.93)",
        backdropFilter: "blur(12px)",
        borderColor: "oklch(0.9 0.008 250)",
      }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-[18px] px-4 py-[13px] sm:gap-[26px] sm:px-[28px]">
        <Link href="/" aria-label="חזרה לדף הראשי" className="flex items-center">
          <Image src="/logo.png" alt="קולאקטייב" height={66} width={180} className="h-[66px] w-auto" priority />
        </Link>

        <nav className="flex gap-1.5 overflow-x-auto ms-1 sm:ms-[10px]">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  background: active ? "oklch(0.945 0.008 250)" : "transparent",
                  color: active ? "oklch(0.24 0.012 250)" : "oklch(0.5 0.012 250)",
                }}
                className="whitespace-nowrap rounded-[9px] px-[15px] py-2 text-[15px] font-bold"
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div
          className="flex items-center gap-2 rounded-full px-[13px] py-1.5 text-[13px] font-bold"
          style={{ color: "oklch(0.42 0.13 145)", background: "oklch(0.95 0.03 145)" }}
        >
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: "oklch(0.62 0.15 145)", animation: "livePulse 1.8s ease-in-out infinite" }}
          />
          סריקה אחרונה {lastScanLabel}
        </div>

        {profile ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              style={{ background: "oklch(0.62 0.15 145)", color: "oklch(0.16 0.03 145)" }}
              className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border-none text-sm font-extrabold"
            >
              {initialsOf(profile.full_name)}
            </button>
            {menuOpen && (
              <div
                className="absolute start-0 top-[46px] z-30 min-w-[218px] rounded-[14px] border p-2"
                style={{
                  background: "oklch(0.99 0.003 240)",
                  borderColor: "oklch(0.9 0.008 250)",
                  boxShadow: "0 18px 44px oklch(0.2 0.02 250 / 0.18)",
                }}
              >
                <div className="px-3 pb-3 pt-2.5">
                  <div className="text-[15px] font-extrabold">{profile.full_name}</div>
                  <div className="mt-0.5 text-[13px]" style={{ color: "oklch(0.52 0.012 250)" }}>
                    {profile.email}
                  </div>
                </div>
                <div className="grid gap-0.5 border-t pt-1.5" style={{ borderColor: "oklch(0.93 0.008 250)" }}>
                  <Link
                    href="/me"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-[9px] px-3 py-[9px] text-right text-sm font-semibold"
                    style={{ color: "oklch(0.3 0.012 250)" }}
                  >
                    האזור האישי
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="cursor-pointer rounded-[9px] border-none bg-transparent px-3 py-[9px] text-right text-sm font-semibold"
                    style={{ color: "oklch(0.44 0.14 30)" }}
                  >
                    יציאה מהחשבון
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openLogin}
              className="cursor-pointer rounded-md border-none bg-transparent px-2.5 py-2 text-sm font-bold"
              style={{ color: "oklch(0.4 0.012 250)" }}
            >
              כבר נרשמתי
            </button>
            <button
              type="button"
              onClick={openSignup}
              className="cursor-pointer rounded-full border-none px-5 py-2.5 text-sm font-bold"
              style={{ background: "oklch(0.24 0.012 250)", color: "oklch(0.98 0.003 240)" }}
            >
              הרשמה חינם
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
