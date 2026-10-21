"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/app.store";
import { mealsApi } from "@/lib/api/meals";
import { MacroBar } from "@/components/ui/MacroBar";
import type { DailyMacros, MealHistory } from "@/lib/api/types";

export function HistoryView() {
  const uid = useAppStore((s) => s.uid);
  const profile = useAppStore((s) => s.profile);
  const [history, setHistory] = useState<MealHistory | null>(null);
  const [selected, setSelected] = useState<DailyMacros | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mealsApi
      .getHistory(uid, 30)
      .then((h) => {
        setHistory(h);
        if (h.daily_breakdown.length > 0) {
          setSelected(h.daily_breakdown[h.daily_breakdown.length - 1]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [uid]);

  const targets = profile
    ? {
        calories: profile.kcal_daily,
        protein: profile.protein_daily,
        fat: profile.fat_daily,
        carbs: profile.carbs_daily,
      }
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-5">
        <h1 className="text-[15px] font-medium text-neutral-200">History</h1>
        <p
          className="text-[11px] text-neutral-600 mt-0.5"
          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
        >
          Last 30 days
        </p>
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-10 rounded-[8px]" />
          ))}
        </div>
      )}

      {!loading && !history?.daily_breakdown.length && (
        <div className="text-center py-16 text-neutral-700 text-[13px]">
          No history yet. Start logging meals.
        </div>
      )}

      {!loading && history && history.daily_breakdown.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Averages */}
          <div
            className="rounded-[12px] px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-2"
            style={{
              background: "#111118",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <p className="text-[10px] text-neutral-700 uppercase tracking-wide mb-1">
                Avg. Calories
              </p>
              <p
                className="text-[22px] font-light text-neutral-100"
                style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
              >
                {Math.round(history.average_calories).toLocaleString()}
              </p>
              <p className="text-[10px] text-neutral-600">kcal / day</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-700 uppercase tracking-wide mb-1">
                Avg. Protein
              </p>
              <p
                className="text-[22px] font-light text-[#4FC4B8]"
                style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
              >
                {Math.round(history.average_protein)}g
              </p>
              <p className="text-[10px] text-neutral-600">per day</p>
            </div>
          </div>

          {/* Day list */}
          <div className="flex flex-col gap-1">
            {[...history.daily_breakdown].reverse().map((day) => (
              <button
                key={day.meal_date}
                onClick={() => setSelected(day)}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[10px] text-left transition-all ${
                  selected?.meal_date === day.meal_date
                    ? "bg-[#4FC4B8]/8 border border-[#4FC4B8]/20"
                    : "hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <span
                  className="text-[12px] text-neutral-400 w-20 shrink-0"
                  style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                >
                  {day.meal_date}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  {/* Mini calorie bar */}
                  <div className="flex-1 h-[3px] rounded-full bg-[#1E1E2A]">
                    <div
                      className="h-full rounded-full bg-[#7B8CDE]"
                      style={{
                        width: `${
                          targets
                            ? Math.min(
                                (day.calories / targets.calories) * 100,
                                100
                              )
                            : 60
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <span
                  className="text-[12px] text-neutral-400 w-20 text-right shrink-0"
                  style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                >
                  {Math.round(day.calories).toLocaleString()} kcal
                </span>
                <span className="text-[11px] text-neutral-700 w-12 text-right shrink-0">
                  {day.meal_count} meal{day.meal_count !== 1 ? "s" : ""}
                </span>
              </button>
            ))}
          </div>

          {/* Selected day detail */}
          {selected && (
            <div
              className="rounded-[12px] p-5 flex flex-col gap-4"
              style={{
                background: "#111118",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-[12px] text-neutral-500"
                style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
              >
                {selected.meal_date}
              </p>
              <MacroBar
                label="Calories"
                consumed={selected.calories}
                target={targets?.calories ?? 0}
                unit="kcal"
                color="bg-[#7B8CDE]"
              />
              <MacroBar
                label="Protein"
                consumed={selected.protein}
                target={targets?.protein ?? 0}
                unit="g"
                color="bg-[#4FC4B8]"
              />
              <MacroBar
                label="Fat"
                consumed={selected.fat}
                target={targets?.fat ?? 0}
                unit="g"
                color="bg-[#E8A040]"
              />
              <MacroBar
                label="Carbs"
                consumed={selected.carbs}
                target={targets?.carbs ?? 0}
                unit="g"
                color="bg-[#9B6DCC]"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
