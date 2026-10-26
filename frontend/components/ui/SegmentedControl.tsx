import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex gap-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={cn(
            "flex-1 rounded-[7px] border py-1.5 text-[11px] capitalize transition-colors",
            value === option
              ? "border-accent/30 bg-accent/15 text-accent"
              : "border-white/6 text-neutral-600 hover:text-neutral-400",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
