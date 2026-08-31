"use client";

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  label: string;
}

export function Toggle({ on, onToggle, label }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={label}
      style={{
        background: on ? "oklch(0.62 0.15 145)" : "oklch(0.87 0.008 250)",
        justifyContent: on ? "flex-start" : "flex-end",
      }}
      className="flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full border-none p-[3px]"
    >
      <span className="block h-5 w-5 rounded-full bg-white" />
    </button>
  );
}
