"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, Plus, Check, X } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { mealsApi } from "@/lib/api/meals";
import { formatTime, formatKcal } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FoodItem, Meal } from "@/lib/api/types";

// ── Inline gram editor ─────────────────────────────────────────
function GramCell({
  item,
  mealId,
  uid,
  onUpdate,
}: {
  item: FoodItem;
  mealId: string;
  uid: string;
  onUpdate: (itemId: string, grams: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(Math.round(item.grams)));
  const addNotification = useAppStore((s) => s.addNotification);

  const commit = async () => {
    setEditing(false);
    const parsed = parseFloat(value);
    if (!parsed || parsed <= 0 || parsed === item.grams) {
      setValue(String(Math.round(item.grams)));
      return;
    }
    try {
      await mealsApi.patchItem(uid, item.item_id, { meal_id: mealId, grams: parsed });
      onUpdate(item.item_id, parsed);
    } catch {
      addNotification({ type: "error", message: "Could not update grams" });
      setValue(String(Math.round(item.grams)));
    }
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setEditing(false);
            setValue(String(Math.round(item.grams)));
          }
        }}
        className="w-12 bg-[#1E1E2A] border border-[#4FC4B8]/40 rounded px-1 py-0.5 text-[11px] text-neutral-200 focus:outline-none text-center"
        style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-[11px] text-neutral-600 hover:text-[#4FC4B8] transition-colors"
      style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
      title="Click to edit grams"
    >
      {Math.round(item.grams)}g
    </button>
  );
}

// ── Add-item inline form ───────────────────────────────────────
function AddItemForm({
  mealId,
  uid,
  onAdd,
  onCancel,
}: {
  mealId: string;
  uid: string;
  onAdd: (item: FoodItem) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [grams, setGrams] = useState("100");
  const [saving, setSaving] = useState(false);
  const addNotification = useAppStore((s) => s.addNotification);

  const handleAdd = async () => {
    const trimmed = name.trim();
    const g = parseFloat(grams);
    if (!trimmed || !g || g <= 0) return;
    setSaving(true);
    try {
      const item = await mealsApi.addItem(uid, {
        meal_id: mealId,
        item_name: trimmed,
        grams: g,
      });
      onAdd(item);
      addNotification({ type: "success", message: `Added ${item.item_name}` });
    } catch {
      addNotification({ type: "error", message: "Food not found in database" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-2 items-center mt-1 mb-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Food name"
        className={cn(
          "flex-1 bg-[#1E1E2A] border border-[rgba(255,255,255,0.08)] rounded px-2 py-1",
          "text-[12px] text-neutral-200 focus:outline-none focus:border-[#4FC4B8]/40",
          "placeholder:text-neutral-700"
        )}
      />
      <input
        value={grams}
        onChange={(e) => setGrams(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
        className="w-14 bg-[#1E1E2A] border border-[rgba(255,255,255,0.08)] rounded px-2 py-1 text-[12px] text-neutral-200 focus:outline-none focus:border-[#4FC4B8]/40 text-center"
        style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
        placeholder="100"
      />
      <span className="text-[11px] text-neutral-700">g</span>
      <button
        onClick={handleAdd}
        disabled={saving}
        className="p-1.5 rounded bg-[#4FC4B8]/15 text-[#4FC4B8] hover:bg-[#4FC4B8]/25 transition-colors disabled:opacity-40"
      >
        <Check size={12} />
      </button>
      <button
        onClick={onCancel}
        className="p-1.5 rounded hover:bg-white/5 text-neutral-600 hover:text-neutral-400 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── MealCard ───────────────────────────────────────────────────
interface MealCardProps {
  meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
  const [expanded, setExpanded]     = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [items, setItems]           = useState<FoodItem[]>(meal.items);
  const [addingItem, setAddingItem] = useState(false);

  const removeMeal      = useAppStore((s) => s.removeMeal);
  const addNotification = useAppStore((s) => s.addNotification);
  const uid             = useAppStore((s) => s.uid);

  const totalCals  = items.reduce((s, i) => s + i.calories, 0);
  const totalProt  = items.reduce((s, i) => s + i.protein, 0);
  const totalFat   = items.reduce((s, i) => s + i.fat, 0);
  const totalCarbs = items.reduce((s, i) => s + i.carbs, 0);

  const handleDeleteMeal = async () => {
    setDeleting(true);
    try {
      await mealsApi.deleteMeal(uid, meal.meal_id);
      removeMeal(meal.meal_id);
      addNotification({ type: "success", message: "Meal removed" });
    } catch {
      addNotification({ type: "error", message: "Could not delete meal" });
      setDeleting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const removed = items.find((i) => i.item_id === itemId);
    setItems((prev) => prev.filter((i) => i.item_id !== itemId));
    try {
      await mealsApi.deleteItem(uid, itemId, meal.meal_id);
    } catch {
      if (removed) setItems((prev) => [...prev, removed]);
      addNotification({ type: "error", message: "Could not remove item" });
    }
  };

  const handleUpdateGrams = (itemId: string, newGrams: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.item_id !== itemId) return i;
        const scale = newGrams / i.grams;
        return {
          ...i,
          grams:    newGrams,
          calories: Math.round(i.calories * scale * 10) / 10,
          protein:  Math.round(i.protein  * scale * 10) / 10,
          fat:      Math.round(i.fat      * scale * 10) / 10,
          carbs:    Math.round(i.carbs    * scale * 10) / 10,
        };
      })
    );
  };

  const handleAddItem = (item: FoodItem) => {
    setItems((prev) => [...prev, item]);
    setAddingItem(false);
  };

  const itemNames = items.slice(0, 3).map((i) => i.item_name).join(", ");
  const moreCount = items.length - 3;

  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-150",
        "border border-[rgba(255,255,255,0.06)]",
        "hover:border-[rgba(255,255,255,0.10)]",
        deleting && "opacity-40 pointer-events-none"
      )}
      style={{ background: "#161620" }}
    >
      {/* ── Header ── */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          className="text-[11px] text-neutral-600 w-10 shrink-0"
          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
        >
          {formatTime(meal.date_time)}
        </span>

        <span className="flex-1 text-[13px] text-neutral-200 truncate">
          {itemNames}
          {moreCount > 0 && (
            <span className="text-neutral-600"> +{moreCount}</span>
          )}
        </span>

        <span
          className="text-[13px] text-neutral-300 shrink-0"
          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
        >
          {formatKcal(totalCals)}&thinsp;kcal
        </span>

        <span className="text-neutral-600 ml-1">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="px-4 pb-3 animate-fade-in">
          {/* Macro summary */}
          <div
            className="flex gap-4 mb-3 text-[11px] pb-2 border-b border-[rgba(255,255,255,0.05)]"
            style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
          >
            <span className="text-[#4FC4B8]">P {Math.round(totalProt)}g</span>
            <span className="text-[#E8A040]">F {Math.round(totalFat)}g</span>
            <span className="text-[#9B6DCC]">C {Math.round(totalCarbs)}g</span>
          </div>

          {/* Items list */}
          <div className="flex flex-col gap-1.5 mb-2">
            {items.map((item) => (
              <div
                key={item.item_id}
                className="flex items-center gap-2 group py-0.5"
              >
                <span className="text-[12px] text-neutral-300 flex-1 truncate">
                  {item.item_name}
                </span>
                <div
                  className="flex items-center gap-2"
                  style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                >
                  <GramCell
                    item={item}
                    mealId={meal.meal_id}
                    uid={uid}
                    onUpdate={handleUpdateGrams}
                  />
                  <span className="text-[11px] text-neutral-600">
                    {Math.round(item.calories)} kcal
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.item_id)}
                    className="text-neutral-700 hover:text-[#E05252] transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove item"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add item */}
          {addingItem ? (
            <AddItemForm
              mealId={meal.meal_id}
              uid={uid}
              onAdd={handleAddItem}
              onCancel={() => setAddingItem(false)}
            />
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="flex items-center gap-1.5 text-[11px] text-neutral-700 hover:text-[#4FC4B8] transition-colors mb-3"
            >
              <Plus size={11} />
              Add food item
            </button>
          )}

          {/* Delete meal */}
          <div className="pt-2 border-t border-[rgba(255,255,255,0.04)]">
            <button
              onClick={handleDeleteMeal}
              className="flex items-center gap-1.5 text-[11px] text-neutral-600 hover:text-[#E05252] transition-colors"
            >
              <Trash2 size={12} />
              Delete meal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
