"use client";

import { useAppStore } from "@/lib/store/app.store";
import { MacroBar } from "@/components/ui/MacroBar";

export function MacroPanel() {
  const totals  = useAppStore((s) => s.todayTotals);
  const profile = useAppStore((s) => s.profile);

  const targets = profile
    ? {
        calories: profile.kcal_daily,
        protein:  profile.protein_daily,
        fat:      profile.fat_daily,
        carbs:    profile.carbs_daily,
      }
    : { calories: 0, protein: 0, fat: 0, carbs: 0 };

  return (
    <div
      className="rounded-[14px] p-5 flex flex-col gap-4"
      style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Calories hero */}
      <div className="flex items-end gap-2">
        <span
          className="text-[2.2rem] font-light leading-none text-neutral-100"
          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
        >
          {Math.round(totals.calories).toLocaleString()}
        </span>
        <span className="text-[13px] text-neutral-600 mb-1">
          {targets.calories > 0
            ? `/ ${targets.calories.toLocaleString()} kcal`
            : "kcal"}
        </span>
      </div>

      {/* Macro bars */}
      <div className="flex flex-col gap-4 pt-1">
        <MacroBar
          label="Protein"
          consumed={totals.protein}
          target={targets.protein}
          unit="g"
          color="bg-[#4FC4B8]"
        />
        <MacroBar
          label="Fat"
          consumed={totals.fat}
          target={targets.fat}
          unit="g"
          color="bg-[#E8A040]"
        />
        <MacroBar
          label="Carbs"
          consumed={totals.carbs}
          target={targets.carbs}
          unit="g"
          color="bg-[#9B6DCC]"
        />
      </div>

      {!profile && (
        <p className="text-[11px] text-neutral-600 text-center pt-1">
          Set up your profile to see targets
        </p>
      )}
    </div>
  );
}
