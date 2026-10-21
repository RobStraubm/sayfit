"use client";

import { useState } from "react";
import { Trash2, Check, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { mealsApi } from "@/lib/api/meals";
import { cn } from "@/lib/utils";
import type { Meal, FoodItem } from "@/lib/api/types";

function ConfidenceTag({ level }: { level?: string }) {
  if (!level || level === "high") return null;
  const isLow = level === "low";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono",
        isLow
          ? "bg-[#E8A040]/10 text-[#E8A040] border border-[#E8A040]/20"
          : "bg-[#5B9CF6]/10 text-[#5B9CF6] border border-[#5B9CF6]/20"
      )}
      style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
    >
      {isLow && <AlertTriangle size={9} />}
      {isLow ? "LOW CONF" : "MED"}
    </span>
  );
}

function FoodItemRow({
  item,
  onRemove,
}: {
  item: FoodItem;
  onRemove: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-[8px] transition-colors hover:bg-white/[0.02]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] text-neutral-200 truncate">
            {item.item_name}
          </span>
        </div>
        <div
          className="flex gap-3 text-[11px] text-neutral-600"
          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
        >
          <span>{Math.round(item.grams)}g</span>
          <span className="text-neutral-700">·</span>
          <span>{Math.round(item.calories)} kcal</span>
          <span className="text-neutral-700">·</span>
          <span className="text-[#4FC4B8]">P{Math.round(item.protein)}</span>
          <span className="text-[#E8A040]">F{Math.round(item.fat)}</span>
          <span className="text-[#9B6DCC]">C{Math.round(item.carbs)}</span>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="text-neutral-700 hover:text-[#E05252] transition-colors p-1 rounded"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

interface CorrectionPanelProps {
  meal: Meal;
}

export function CorrectionPanel({ meal }: CorrectionPanelProps) {
  const [items, setItems] = useState<FoodItem[]>(meal.items);
  const [saving, setSaving]       = useState(false);

  const uid             = useAppStore((s) => s.uid);
  const addMeal         = useAppStore((s) => s.addMeal);
  const addNotification = useAppStore((s) => s.addNotification);
  const closeLogFlow    = useAppStore((s) => s.closeLogFlow);
  const setLogStep      = useAppStore((s) => s.setLogStep);

  const totalCals  = items.reduce((s, i) => s + i.calories, 0);

  const removeItem = async (itemId: string) => {
    const removedItem = items.find((i) => i.item_id === itemId);
    const next = items.filter((i) => i.item_id !== itemId);
    setItems(next);

    try {
      await mealsApi.deleteItem(uid, itemId, meal.meal_id);
    } catch {
      // Revert
      if (removedItem) setItems((prev) => [...prev, removedItem]);
      addNotification({ type: "error", message: "Could not remove item" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Meal is already saved in DB from /log call — we just update UI
      const updatedMeal: Meal = { ...meal, items };
      addMeal(updatedMeal);
      addNotification({
        type: "success",
        message: `Meal saved — ${Math.round(totalCals)} kcal logged`,
      });
      setLogStep("confirmed");
    } catch {
      addNotification({ type: "error", message: "Could not save meal" });
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-neutral-600 text-[13px]">All items removed.</p>
        <button
          onClick={closeLogFlow}
          className="text-[13px] text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="text-[15px] font-medium text-neutral-100">
          Review Results
        </h2>
        <p className="text-[12px] text-neutral-600 mt-0.5">
          {items.length} item{items.length !== 1 ? "s" : ""} found ·{" "}
          <span
            className="text-neutral-400"
            style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
          >
            {Math.round(totalCals)} kcal
          </span>
        </p>
      </div>

      {/* Items */}
      <div
        className="rounded-[10px] divide-y divide-[rgba(255,255,255,0.04)]"
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {items.map((item) => (
          <FoodItemRow
            key={item.item_id}
            item={item}
            onRemove={() => removeItem(item.item_id)}
          />
        ))}
      </div>

      {/* Totals summary */}
      <div
        className="flex justify-between items-center px-3 py-2.5 rounded-[8px] text-[12px]"
        style={{ background: "#0D0D14", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span className="text-neutral-600">Total</span>
        <div
          className="flex gap-4"
          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
        >
          <span className="text-neutral-300">
            {Math.round(totalCals)} kcal
          </span>
          <span className="text-[#4FC4B8]">
            P{Math.round(items.reduce((s, i) => s + i.protein, 0))}g
          </span>
          <span className="text-[#E8A040]">
            F{Math.round(items.reduce((s, i) => s + i.fat, 0))}g
          </span>
          <span className="text-[#9B6DCC]">
            C{Math.round(items.reduce((s, i) => s + i.carbs, 0))}g
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={closeLogFlow}
          className="px-4 py-2 text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors rounded-[8px] hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-[8px] text-[13px] font-medium transition-all",
            "bg-[#4FC4B8] text-[#0A0A0F] hover:bg-[#6DCFC4]",
            "shadow-[0_0_16px_rgba(79,196,184,0.2)]",
            saving && "opacity-60 cursor-not-allowed"
          )}
        >
          <Check size={14} />
          Save Meal
        </button>
      </div>
    </div>
  );
}
