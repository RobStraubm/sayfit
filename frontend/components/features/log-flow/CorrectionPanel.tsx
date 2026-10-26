"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { mealsApi } from "@/lib/api/meals";
import { useAddMealToToday } from "@/lib/api/queries";
import { sumMacros } from "@/lib/macros";
import { errorMessage, formatGrams } from "@/lib/utils";
import type { FoodItem, Meal } from "@/lib/api/types";

function FoodItemRow({
  item,
  onRemove,
}: {
  item: FoodItem;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 transition-colors hover:bg-white/2">
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="truncate text-[13px] text-neutral-200">
            {item.item_name}
          </span>
        </div>
        <div className="flex gap-3 font-mono text-[11px] text-neutral-600">
          <span>{formatGrams(item.grams)}</span>
          <span className="text-neutral-700">·</span>
          <span>{Math.round(item.calories)} kcal</span>
          <span className="text-neutral-700">·</span>
          <span className="text-macro-protein">
            P{Math.round(item.protein)}
          </span>
          <span className="text-macro-fat">F{Math.round(item.fat)}</span>
          <span className="text-macro-carbs">C{Math.round(item.carbs)}</span>
        </div>
      </div>

      <button
        onClick={onRemove}
        aria-label={`Remove ${item.item_name}`}
        className="rounded p-1 text-neutral-700 transition-colors hover:text-danger"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

/**
 * Review step after the pipeline. POST /log has already saved the meal, so
 * removing an item deletes it on the server and "Save" only confirms.
 */
export function CorrectionPanel({ meal }: { meal: Meal }) {
  const [items, setItems] = useState<FoodItem[]>(meal.items);

  const uid = useAppStore((s) => s.uid);
  const addNotification = useAppStore((s) => s.addNotification);
  const closeLogFlow = useAppStore((s) => s.closeLogFlow);
  const setLogStep = useAppStore((s) => s.setLogStep);
  const addMealToToday = useAddMealToToday();

  const totals = sumMacros(items);

  const removeItem = async (item: FoodItem) => {
    setItems((prev) => prev.filter((i) => i.item_id !== item.item_id));
    try {
      await mealsApi.deleteItem(uid, item.item_id, meal.meal_id);
    } catch (err) {
      setItems((prev) => [...prev, item]);
      addNotification({
        type: "error",
        message: errorMessage(err, "Could not remove item"),
      });
    }
  };

  const handleSave = () => {
    void addMealToToday({ ...meal, items });
    addNotification({
      type: "success",
      message: `Meal saved — ${Math.round(totals.calories)} kcal logged`,
    });
    setLogStep("confirmed");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-[13px] text-neutral-600">All items removed.</p>
        <button
          onClick={closeLogFlow}
          className="text-[13px] text-neutral-400 transition-colors hover:text-neutral-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[15px] font-medium text-neutral-100">
          Review Results
        </h2>
        <p className="mt-0.5 text-[12px] text-neutral-600">
          {items.length} item{items.length !== 1 ? "s" : ""} found ·{" "}
          <span className="font-mono text-neutral-400">
            {Math.round(totals.calories)} kcal
          </span>
        </p>
      </div>

      <div className="divide-y divide-white/4 rounded-[10px] border border-white/6 bg-surface-1">
        {items.map((item) => (
          <FoodItemRow
            key={item.item_id}
            item={item}
            onRemove={() => removeItem(item)}
          />
        ))}
      </div>

      {/* Totals */}
      <div className="flex items-center justify-between rounded-[8px] border border-white/5 bg-rail px-3 py-2.5 text-[12px]">
        <span className="text-neutral-600">Total</span>
        <div className="flex gap-4 font-mono">
          <span className="text-neutral-300">
            {Math.round(totals.calories)} kcal
          </span>
          <span className="text-macro-protein">
            P{Math.round(totals.protein)}g
          </span>
          <span className="text-macro-fat">F{Math.round(totals.fat)}g</span>
          <span className="text-macro-carbs">C{Math.round(totals.carbs)}g</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={closeLogFlow}
          className="rounded-[8px] px-4 py-2 text-[13px] text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-[8px] bg-accent px-5 py-2 text-[13px] font-medium text-canvas shadow-[0_0_16px_rgba(79,196,184,0.2)] transition-all hover:bg-accent-hover"
        >
          <Check size={14} />
          Save Meal
        </button>
      </div>
    </div>
  );
}
