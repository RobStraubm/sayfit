import type { FoodItem, MacroTotals } from "@/lib/api/types";

export const EMPTY_MACROS: MacroTotals = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
};

export function sumMacros(items: readonly MacroTotals[]): MacroTotals {
  return items.reduce<MacroTotals>(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs,
    }),
    EMPTY_MACROS,
  );
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Rescales an item's macros to a new portion size, rounded to 0.1. */
export function scaleItem(item: FoodItem, grams: number): FoodItem {
  const factor = grams / item.grams;
  return {
    ...item,
    grams,
    calories: round1(item.calories * factor),
    protein: round1(item.protein * factor),
    fat: round1(item.fat * factor),
    carbs: round1(item.carbs * factor),
  };
}
