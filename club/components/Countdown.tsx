"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ until }: { until: string }) {
  const router = useRouter();
  const end = Date.parse(until);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const left = now === null ? null : Math.max(0, end - now);

  // The server decides whether the list is locked, so re-render once time runs out.
  useEffect(() => {
    if (left === 0) router.refresh();
  }, [left, router]);

  if (left === null) return <span className="tabular-nums">--:--:--</span>;
  const s = Math.floor(left / 1000);
  const days = Math.floor(s / 86400);
  const clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return (
    <span dir="ltr" className="tabular-nums">
      {days > 0 ? `${days}d ` : ""}
      {clock}
    </span>
  );
}
