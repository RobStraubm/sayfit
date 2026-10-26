"use client";

import { Plus } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { useTodayMeals } from "@/lib/api/queries";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { sumMacros } from "@/lib/macros";
import { formatDate, formatTime } from "@/lib/utils";
import { LogFlowModal } from "@/components/features/log-flow/LogFlowModal";
import { MacroPanel } from "./MacroPanel";
import { MealCard } from "./MealCard";
import { QuickLogBar } from "./QuickLogBar";

export function Dashboard() {
  const uid = useAppStore((s) => s.uid);
  const openLogFlow = useAppStore((s) => s.openLogFlow);
  const { data: meals = [], isPending } = useTodayMeals();

  // The page is prerendered at build time, so today's date is client-only.
  const today = useIsClient() ? formatDate(new Date().toISOString()) : "";

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-medium text-neutral-200">Today</h1>
            <p className="mt-0.5 font-mono text-[11px] text-neutral-600">
              {today}
            </p>
          </div>
          <span className="rounded-[5px] border border-white/5 px-2 py-1 font-mono text-[11px] text-neutral-700">
            @{uid}
          </span>
        </div>

        <QuickLogBar />

        {/* Meals feed */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] tracking-widest text-neutral-600 uppercase">
              Meals
            </span>
            {meals.length > 0 && (
              <span className="font-mono text-[11px] text-neutral-700">
                {meals.length} logged
              </span>
            )}
          </div>

          {isPending ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 skeleton rounded-[10px]" />
              ))}
            </div>
          ) : meals.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-[12px] border border-dashed border-white/7 bg-white/1 py-12">
              <div className="text-[32px] opacity-20">◎</div>
              <div className="text-center">
                <p className="text-[13px] text-neutral-600">
                  Nothing logged yet today
                </p>
                <p className="mt-1 text-[11px] text-neutral-700">
                  Start by describing what you ate
                </p>
              </div>
              <button
                onClick={() => openLogFlow("text")}
                className="flex items-center gap-2 text-[12px] text-accent transition-colors hover:text-accent-hover"
              >
                <Plus size={13} />
                Log your first meal
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {meals.map((meal) => (
                <MealCard key={meal.meal_id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right context panel */}
      <aside className="hidden w-[280px] flex-col gap-4 overflow-y-auto border-l border-white/5 bg-rail p-5 lg:flex">
        <div>
          <p className="mb-3 text-[10px] tracking-widest text-neutral-700 uppercase">
            Macros
          </p>
          <MacroPanel />
        </div>

        {meals.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] tracking-widest text-neutral-700 uppercase">
              Activity
            </p>
            <div className="flex flex-col gap-1">
              {meals.slice(0, 5).map((meal) => (
                <div
                  key={meal.meal_id}
                  className="flex items-center gap-2 py-1.5"
                >
                  <span className="w-8 shrink-0 font-mono text-[10px] text-neutral-700">
                    {formatTime(meal.date_time)}
                  </span>
                  <span className="truncate text-[11px] text-neutral-600">
                    {meal.items[0]?.item_name ?? "meal"}
                    {meal.items.length > 1 && ` +${meal.items.length - 1}`}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-neutral-700">
                    {Math.round(sumMacros(meal.items).calories)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <LogFlowModal />
    </div>
  );
}
