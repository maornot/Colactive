"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/env";

const STORAGE_KEY = "colactive:savedSources";

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(names: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch {
    // Private browsing / storage disabled — the toggle still works for this render.
  }
}

/** Bodies a visitor has marked to track. Signed-in users persist to Supabase; anonymous visitors use localStorage. */
export function useSavedSources(userId: string | null, initialSaved: string[], bodyIds: Record<string, string>) {
  const [saved, setSaved] = useState<string[]>(() => (userId ? initialSaved : readLocal()));

  const toggle = useCallback(
    async (name: string) => {
      const isSaved = saved.includes(name);
      const next = isSaved ? saved.filter((x) => x !== name) : saved.concat(name);
      setSaved(next);

      if (!userId) {
        writeLocal(next);
        return;
      }

      const bodyId = bodyIds[name];
      if (!bodyId || !hasSupabaseConfig) return;
      const supabase = createClient();
      if (isSaved) {
        await supabase.from("saved_sources").delete().eq("user_id", userId).eq("body_id", bodyId);
      } else {
        await supabase.from("saved_sources").insert({ user_id: userId, body_id: bodyId });
      }
    },
    [saved, userId, bodyIds]
  );

  return { saved, toggle };
}
