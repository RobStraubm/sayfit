"use client";

import { useState } from "react";
import { useMealHistory } from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import { MacroBar } from "@/components/ui/MacroBar";

const DAYS = 30;

export function HistoryView() {
  const { data: history, isPending } = useMealHistory(DAYS);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = history?.daily_breakdown ?? [];
  // Defaults to the most recent day.
  const selected =
    days.find((d) => d.meal_date === selectedDate) ?? days.at(-1);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-5">
        <h1 className="text-[15px] font-medium text-neutral-200">History</h1>
        <p className="mt-0.5 font-mono text-[11px] text-neutral-600">
          Last {DAYS} days
        </p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 skeleton rounded-[8px]" />
          ))}
        </div>
      ) : !history || days.length === 0 ? (
        <div className="py-16 text-center text-[13px] text-neutral-700">
          No history yet. Start logging meals.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Averages */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 rounded-[12px] border border-white/6 bg-surface-1 px-5 py-4">
            <div>
              <p className="mb-1 text-[10px] tracking-wide text-neutral-700 uppercase">
                Avg. Calories
              </p>
              <p className="font-mono text-[22px] font-light text-neutral-100">
                {Math.round(history.average_calories).toLocaleString()}
              </p>
              <p className="text-[10px] text-neutral-600">kcal / day</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] tracking-wide text-neutral-700 uppercase">
                Avg. Protein
              </p>
              <p className="font-mono text-[22px] font-light text-macro-protein">
                {Math.round(history.average_protein)}g
              </p>
              <p className="text-[10px] text-neutral-600">per day</p>
            </div>
          </div>

          {/* Day list, newest first */}
          <div className="flex flex-col gap-1">
            {days.toReversed().map((day) => (
              <button
                key={day.meal_date}
                onClick={() => setSelectedDate(day.meal_date)}
                aria-pressed={selected?.meal_date === day.meal_date}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[10px] border px-4 py-3 text-left transition-all",
                  selected?.meal_date === day.meal_date
                    ? "border-accent/20 bg-accent/8"
                    : "border-transparent hover:bg-white/2",
                )}
              >
                <span className="w-20 shrink-0 font-mono text-[12px] text-neutral-400">
                  {day.meal_date}
                </span>
                <div className="flex flex-1 items-center gap-2">
                  {/* Fixed-width placeholder until there are daily targets to compare against. */}
                  <div className="h-[3px] flex-1 rounded-full bg-surface-3">
                    <div className="h-full w-3/5 rounded-full bg-macro-calories" />
                  </div>
                </div>
                <span className="w-20 shrink-0 text-right font-mono text-[12px] text-neutral-400">
                  {Math.round(day.calories).toLocaleString()} kcal
                </span>
                <span className="w-12 shrink-0 text-right text-[11px] text-neutral-700">
                  {day.meal_count} meal{day.meal_count !== 1 ? "s" : ""}
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="flex flex-col gap-4 rounded-[12px] border border-white/6 bg-surface-1 p-5">
              <p className="font-mono text-[12px] text-neutral-500">
                {selected.meal_date}
              </p>
              <MacroBar
                label="Calories"
                consumed={selected.calories}
                unit="kcal"
                color="bg-macro-calories"
              />
              <MacroBar
                label="Protein"
                consumed={selected.protein}
                unit="g"
                color="bg-macro-protein"
              />
              <MacroBar
                label="Fat"
                consumed={selected.fat}
                unit="g"
                color="bg-macro-fat"
              />
              <MacroBar
                label="Carbs"
                consumed={selected.carbs}
                unit="g"
                color="bg-macro-carbs"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
