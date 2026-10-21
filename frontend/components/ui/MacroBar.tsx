"use client";

import { cn } from "@/lib/utils";

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;    // tailwind bg class
  className?: string;
}

export function MacroBar({
  label,
  consumed,
  target,
  unit,
  color,
  className,
}: MacroBarProps) {
  const over = target > 0 && consumed > target;
  const pct  = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const rem  = target - consumed;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-neutral-400 font-medium tracking-wide uppercase">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span
            className="font-mono text-[13px] text-neutral-100"
            style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
          >
            {Math.round(consumed)}
          </span>
          {target > 0 && (
            <span
              className="font-mono text-[11px] text-neutral-600"
              style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
            >
              / {Math.round(target)} {unit}
            </span>
          )}
          {!target && (
            <span className="text-[11px] text-neutral-600">{unit}</span>
          )}
        </div>
      </div>

      {/* Track */}
      <div className="relative h-[3px] rounded-full bg-[#1E1E2A] overflow-hidden">
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full transition-all duration-700",
            over ? "bg-[#E8A040]" : color
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Status */}
      {target > 0 && (
        <div className="flex justify-end">
          <span
            className={cn(
              "text-[10px] font-mono",
              over ? "text-[#E8A040]" : "text-neutral-600"
            )}
            style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
          >
            {over
              ? `+${Math.round(Math.abs(rem))} ${unit} over`
              : `${Math.round(Math.abs(rem))} ${unit} left`}
          </span>
        </div>
      )}
    </div>
  );
}
