export const chipTone = (active: boolean) => ({
  bg: active ? "oklch(0.62 0.15 145)" : "oklch(0.965 0.005 250)",
  color: active ? "oklch(0.16 0.03 145)" : "oklch(0.35 0.012 250)",
  border: active ? "oklch(0.62 0.15 145)" : "oklch(0.9 0.008 250)",
});

export const chipToneLight = (active: boolean) => ({
  bg: active ? "oklch(0.95 0.03 145)" : "oklch(0.965 0.005 250)",
  color: active ? "oklch(0.38 0.12 145)" : "oklch(0.4 0.012 250)",
  border: active ? "oklch(0.75 0.1 145)" : "oklch(0.9 0.008 250)",
});

export const chipToneDark = (active: boolean) => ({
  bg: active ? "oklch(0.95 0.03 145)" : "oklch(0.29 0.012 250)",
  color: active ? "oklch(0.38 0.12 145)" : "oklch(0.9 0.008 250)",
  border: active ? "oklch(0.75 0.1 145)" : "oklch(0.4 0.012 250)",
});

export const toggleTone = (on: boolean) => ({
  track: on ? "oklch(0.62 0.15 145)" : "oklch(0.87 0.008 250)",
  justify: on ? "flex-start" : "flex-end",
});

export const verifiedBadgeTone = (verified: boolean) => ({
  bg: verified ? "oklch(0.955 0.03 145)" : "oklch(0.945 0.006 250)",
  color: verified ? "oklch(0.38 0.12 145)" : "oklch(0.5 0.012 250)",
});

export const memberStateTone = (state: string) => {
  if (state === "מאומת") return { bg: "oklch(0.955 0.03 145)", color: "oklch(0.38 0.12 145)" };
  if (state === "ממתין לאימות") return { bg: "oklch(0.95 0.05 85)", color: "oklch(0.42 0.11 70)" };
  return { bg: "oklch(0.945 0.006 250)", color: "oklch(0.5 0.012 250)" };
};

export const sourceStatusTone = (status: "תקין" | "איטי" | "תקלה") => {
  if (status === "תקין") return { bg: "oklch(0.955 0.03 145)", color: "oklch(0.38 0.12 145)" };
  if (status === "איטי") return { bg: "oklch(0.95 0.05 85)", color: "oklch(0.42 0.11 70)" };
  return { bg: "oklch(0.94 0.05 30)", color: "oklch(0.44 0.14 30)" };
};

export const confidenceTone = (confidence: number) =>
  confidence >= 85
    ? { bg: "oklch(0.955 0.03 145)", color: "oklch(0.38 0.12 145)" }
    : { bg: "oklch(0.94 0.05 85)", color: "oklch(0.42 0.11 70)" };
