"use client";

import { useTodayTotals } from "@/lib/api/queries";
import { MacroBar } from "@/components/ui/MacroBar";

export function MacroPanel() {
  const totals = useTodayTotals();

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-white/6 bg-surface-1 p-5">
      {/* Calories hero */}
      <div className="flex items-end gap-2">
        <span className="font-mono text-[2.2rem] leading-none font-light text-neutral-100">
          {Math.round(totals.calories).toLocaleString()}
        </span>
        <span className="mb-1 text-[13px] text-neutral-600">kcal</span>
      </div>

      <div className="flex flex-col gap-4 pt-1">
        <MacroBar
          label="Protein"
          consumed={totals.protein}
          unit="g"
          color="bg-macro-protein"
        />
        <MacroBar
          label="Fat"
          consumed={totals.fat}
          unit="g"
          color="bg-macro-fat"
        />
        <MacroBar
          label="Carbs"
          consumed={totals.carbs}
          unit="g"
          color="bg-macro-carbs"
        />
      </div>

      {/* Daily targets need a user profile, which the API does not provide yet. */}
      <p className="pt-1 text-center text-[11px] text-neutral-600">
        Set up your profile to see targets
      </p>
    </div>
  );
}
