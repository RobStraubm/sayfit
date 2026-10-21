"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/app.store";
import { mealsApi } from "@/lib/api/meals";
import { MacroPanel } from "./MacroPanel";
import { MealCard } from "./MealCard";
import { QuickLogBar } from "./QuickLogBar";
import { LogFlowModal } from "@/components/features/log-flow/LogFlowModal";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function Dashboard() {
  const uid          = useAppStore((s) => s.uid);
  const todayMeals   = useAppStore((s) => s.todayMeals);
  const todayLoading = useAppStore((s) => s.todayLoading);
  const setTodayMeals  = useAppStore((s) => s.setTodayMeals);
  const setTodayLoading = useAppStore((s) => s.setTodayLoading);
  const openLogFlow    = useAppStore((s) => s.openLogFlow);

  // Load today's meals on mount
  useEffect(() => {
    const load = async () => {
      setTodayLoading(true);
      try {
        const meals = await mealsApi.getToday(uid);
        setTodayMeals(meals);
      } catch {
        // Backend might not be running — silent fail in dev
      } finally {
        setTodayLoading(false);
      }
    };
    load();
  }, [uid, setTodayMeals, setTodayLoading]);

  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(formatDate(new Date().toISOString()));
  }, []);

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-medium text-neutral-200">Today</h1>
            <p
              className="text-[11px] text-neutral-600 mt-0.5"
              style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
            >
              {today}
            </p>
          </div>
          <span
            className="text-[11px] text-neutral-700 px-2 py-1 rounded-[5px] border border-[rgba(255,255,255,0.05)]"
            style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
          >
            @{uid}
          </span>
        </div>

        {/* Quick log */}
        <QuickLogBar />

        {/* Meals feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-neutral-600 uppercase tracking-widest">
              Meals
            </span>
            {todayMeals.length > 0 && (
              <span
                className="text-[11px] text-neutral-700"
                style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
              >
                {todayMeals.length} logged
              </span>
            )}
          </div>

          {todayLoading && (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton h-12 rounded-[10px]"
                />
              ))}
            </div>
          )}

          {!todayLoading && todayMeals.length === 0 && (
            <div
              className="flex flex-col items-center gap-4 py-12 rounded-[12px]"
              style={{
                border: "1px dashed rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <div className="text-[32px] opacity-20">◎</div>
              <div className="text-center">
                <p className="text-[13px] text-neutral-600">Nothing logged yet today</p>
                <p className="text-[11px] text-neutral-700 mt-1">
                  Start by describing what you ate
                </p>
              </div>
              <button
                onClick={() => openLogFlow("text")}
                className="flex items-center gap-2 text-[12px] text-[#4FC4B8] hover:text-[#6DCFC4] transition-colors"
              >
                <Plus size={13} />
                Log your first meal
              </button>
            </div>
          )}

          {!todayLoading && todayMeals.length > 0 && (
            <div className="flex flex-col gap-2">
              {todayMeals.map((meal) => (
                <MealCard key={meal.meal_id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right context panel */}
      <aside
        className="hidden lg:flex flex-col gap-4 p-5 overflow-y-auto"
        style={{
          width: "280px",
          background: "#0D0D14",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div>
          <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-3">
            Macros
          </p>
          <MacroPanel />
        </div>

        {/* Activity hint */}
        {todayMeals.length > 0 && (
          <div>
            <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-2">
              Activity
            </p>
            <div className="flex flex-col gap-1">
              {todayMeals.slice(0, 5).map((m) => (
                <div
                  key={m.meal_id}
                  className="flex items-center gap-2 py-1.5"
                >
                  <span
                    className="text-[10px] text-neutral-700 w-8 shrink-0"
                    style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                  >
                    {new Date(m.date_time).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-[11px] text-neutral-600 truncate">
                    {m.items[0]?.item_name ?? "meal"}
                    {m.items.length > 1 && ` +${m.items.length - 1}`}
                  </span>
                  <span
                    className="ml-auto text-[10px] text-neutral-700 shrink-0"
                    style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                  >
                    {Math.round(m.items.reduce((s, i) => s + i.calories, 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Log Flow Modal */}
      <LogFlowModal />
    </div>
  );
}
