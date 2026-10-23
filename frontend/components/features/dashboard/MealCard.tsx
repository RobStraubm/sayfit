"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import {
  useAddItem,
  useDeleteItem,
  useDeleteMeal,
  useUpdateGrams,
} from "@/lib/api/queries";
import { sumMacros } from "@/lib/macros";
import {
  cn,
  errorMessage,
  formatGrams,
  formatKcal,
  formatTime,
} from "@/lib/utils";
import type { FoodItem, Meal } from "@/lib/api/types";

const inputClass = cn(
  "rounded border border-white/8 bg-surface-3 py-1 text-[12px] text-neutral-200",
  "placeholder:text-neutral-700 focus:border-accent/40 focus:outline-none",
);

// ── Inline gram editor ─────────────────────────────────────────
function GramCell({ item, mealId }: { item: FoodItem; mealId: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const updateGrams = useUpdateGrams();
  const addNotification = useAppStore((s) => s.addNotification);

  const startEditing = () => {
    setValue(String(Math.round(item.grams)));
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const grams = parseFloat(value);
    if (!grams || grams <= 0 || grams === item.grams) return;
    updateGrams.mutate(
      { mealId, itemId: item.item_id, grams },
      {
        onError: (err) =>
          addNotification({
            type: "error",
            message: errorMessage(err, "Could not update grams"),
          }),
      },
    );
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
          if (e.key === "Escape") setEditing(false);
        }}
        aria-label={`Grams of ${item.item_name}`}
        className="w-12 rounded border border-accent/40 bg-surface-3 px-1 py-0.5 text-center font-mono text-[11px] text-neutral-200 focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={startEditing}
      className="font-mono text-[11px] text-neutral-600 transition-colors hover:text-accent"
      title="Click to edit grams"
    >
      {formatGrams(item.grams)}
    </button>
  );
}

// ── Add-item inline form ───────────────────────────────────────
function AddItemForm({
  mealId,
  onDone,
}: {
  mealId: string;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [grams, setGrams] = useState("100");
  const addItem = useAddItem();
  const addNotification = useAppStore((s) => s.addNotification);

  const handleAdd = () => {
    const trimmed = name.trim();
    const g = parseFloat(grams);
    if (!trimmed || !g || g <= 0) return;
    addItem.mutate(
      { mealId, name: trimmed, grams: g },
      {
        onSuccess: (item) => {
          addNotification({
            type: "success",
            message: `Added ${item.item_name}`,
          });
          onDone();
        },
        onError: (err) =>
          addNotification({
            type: "error",
            message: errorMessage(err, "Food not found in database"),
          }),
      },
    );
  };

  return (
    <div className="mt-1 mb-2 flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
          if (e.key === "Escape") onDone();
        }}
        placeholder="Food name"
        aria-label="Food name"
        className={cn(inputClass, "flex-1 px-2")}
      />
      <input
        value={grams}
        onChange={(e) => setGrams(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
        placeholder="100"
        aria-label="Grams"
        className={cn(inputClass, "w-14 px-2 text-center font-mono")}
      />
      <span className="text-[11px] text-neutral-700">g</span>
      <button
        onClick={handleAdd}
        disabled={addItem.isPending}
        aria-label="Add item"
        className="rounded bg-accent/15 p-1.5 text-accent transition-colors hover:bg-accent/25 disabled:opacity-40"
      >
        <Check size={12} />
      </button>
      <button
        onClick={onDone}
        aria-label="Cancel"
        className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-white/5 hover:text-neutral-400"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── MealCard ───────────────────────────────────────────────────
export function MealCard({ meal }: { meal: Meal }) {
  const [expanded, setExpanded] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  const deleteItem = useDeleteItem();
  const deleteMeal = useDeleteMeal();
  const addNotification = useAppStore((s) => s.addNotification);

  const { items } = meal;
  const totals = sumMacros(items);
  const itemNames = items
    .slice(0, 3)
    .map((i) => i.item_name)
    .join(", ");
  const moreCount = items.length - 3;

  const handleDeleteMeal = () =>
    deleteMeal.mutate(meal.meal_id, {
      onSuccess: () =>
        addNotification({ type: "success", message: "Meal removed" }),
      onError: (err) =>
        addNotification({
          type: "error",
          message: errorMessage(err, "Could not delete meal"),
        }),
    });

  const handleDeleteItem = (itemId: string) =>
    deleteItem.mutate(
      { mealId: meal.meal_id, itemId },
      {
        onError: (err) =>
          addNotification({
            type: "error",
            message: errorMessage(err, "Could not remove item"),
          }),
      },
    );

  return (
    <div
      className={cn(
        "rounded-xl border border-white/6 bg-surface-2 transition-all duration-150 hover:border-white/10",
        deleteMeal.isPending && "pointer-events-none opacity-40",
      )}
    >
      {/* Header */}
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="w-10 shrink-0 font-mono text-[11px] text-neutral-600">
          {formatTime(meal.date_time)}
        </span>

        <span className="flex-1 truncate text-[13px] text-neutral-200">
          {itemNames}
          {moreCount > 0 && (
            <span className="text-neutral-600"> +{moreCount}</span>
          )}
        </span>

        <span className="shrink-0 font-mono text-[13px] text-neutral-300">
          {formatKcal(totals.calories)}&thinsp;kcal
        </span>

        <span className="ml-1 text-neutral-600">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {expanded && (
        <div className="animate-fade-in px-4 pb-3">
          {/* Macro summary */}
          <div className="mb-3 flex gap-4 border-b border-white/5 pb-2 font-mono text-[11px]">
            <span className="text-macro-protein">
              P {Math.round(totals.protein)}g
            </span>
            <span className="text-macro-fat">F {Math.round(totals.fat)}g</span>
            <span className="text-macro-carbs">
              C {Math.round(totals.carbs)}g
            </span>
          </div>

          <div className="mb-2 flex flex-col gap-1.5">
            {items.map((item) => (
              <div
                key={item.item_id}
                className="group flex items-center gap-2 py-0.5"
              >
                <span className="flex-1 truncate text-[12px] text-neutral-300">
                  {item.item_name}
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <GramCell item={item} mealId={meal.meal_id} />
                  <span className="text-[11px] text-neutral-600">
                    {Math.round(item.calories)} kcal
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.item_id)}
                    className="text-neutral-700 opacity-0 transition-colors group-hover:opacity-100 hover:text-danger"
                    title="Remove item"
                    aria-label={`Remove ${item.item_name}`}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {addingItem ? (
            <AddItemForm
              mealId={meal.meal_id}
              onDone={() => setAddingItem(false)}
            />
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="mb-3 flex items-center gap-1.5 text-[11px] text-neutral-700 transition-colors hover:text-accent"
            >
              <Plus size={11} />
              Add food item
            </button>
          )}

          <div className="border-t border-white/4 pt-2">
            <button
              onClick={handleDeleteMeal}
              className="flex items-center gap-1.5 text-[11px] text-neutral-600 transition-colors hover:text-danger"
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
