"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/app.store";
import { useTodayTotals } from "@/lib/api/queries";

const AUTO_CLOSE_MS = 3000;

export function ConfirmedStep() {
  const closeLogFlow = useAppStore((s) => s.closeLogFlow);
  const totals = useTodayTotals();

  useEffect(() => {
    const t = setTimeout(closeLogFlow, AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [closeLogFlow]);

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-success/25 bg-success/12">
        <span className="text-2xl text-success">✓</span>
      </div>

      <div className="text-center">
        <p className="text-[16px] font-medium text-neutral-100">Meal saved</p>
        <p className="mt-1 font-mono text-[13px] text-neutral-500">
          {Math.round(totals.calories).toLocaleString()} kcal today
        </p>
      </div>

      <button
        onClick={closeLogFlow}
        className="text-[12px] text-neutral-600 transition-colors hover:text-neutral-400"
      >
        Close
      </button>
    </div>
  );
}
