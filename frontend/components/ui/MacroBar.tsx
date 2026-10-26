import { cn, isOver, pct } from "@/lib/utils";

interface MacroBarProps {
  label: string;
  consumed: number;
  /** Daily target; without one the bar shows only the consumed amount. */
  target?: number;
  unit: string;
  /** Tailwind background class for the filled part, e.g. "bg-macro-fat". */
  color: string;
  className?: string;
}

export function MacroBar({
  label,
  consumed,
  target = 0,
  unit,
  color,
  className,
}: MacroBarProps) {
  const over = isOver(consumed, target);
  const remaining = Math.round(Math.abs(target - consumed));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium tracking-wide text-neutral-400 uppercase">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-[13px] text-neutral-100">
            {Math.round(consumed)}
          </span>
          {target > 0 ? (
            <span className="font-mono text-[11px] text-neutral-600">
              / {Math.round(target)} {unit}
            </span>
          ) : (
            <span className="text-[11px] text-neutral-600">{unit}</span>
          )}
        </div>
      </div>

      {/* Track */}
      <div className="relative h-[3px] overflow-hidden rounded-full bg-surface-3">
        <div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-700",
            over ? "bg-warning" : color,
          )}
          style={{ width: `${pct(consumed, target)}%` }}
        />
      </div>

      {target > 0 && (
        <div className="flex justify-end">
          <span
            className={cn(
              "font-mono text-[10px]",
              over ? "text-warning" : "text-neutral-600",
            )}
          >
            {over ? `+${remaining} ${unit} over` : `${remaining} ${unit} left`}
          </span>
        </div>
      )}
    </div>
  );
}
