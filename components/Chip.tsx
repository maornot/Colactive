"use client";

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  tone: { bg: string; color: string; border: string };
}

export function Chip({ label, active, onClick, tone }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ background: tone.bg, color: tone.color, borderColor: tone.border }}
      className="cursor-pointer rounded-full border px-[15px] py-[7px] text-sm font-semibold transition-colors"
    >
      {label}
    </button>
  );
}
