import { describe, expect, it } from "vitest";
import { EMPTY_MACROS, scaleItem, sumMacros } from "./macros";
import type { FoodItem } from "./api/types";

const egg: FoodItem = {
  item_id: "1",
  item_name: "egg",
  grams: 50,
  calories: 72,
  protein: 6.3,
  fat: 4.8,
  carbs: 0.4,
};

describe("sumMacros", () => {
  it("returns zeros for no items", () => {
    expect(sumMacros([])).toEqual(EMPTY_MACROS);
  });

  it("adds up all four macros", () => {
    expect(sumMacros([egg, egg])).toEqual({
      calories: 144,
      protein: 12.6,
      fat: 9.6,
      carbs: 0.8,
    });
  });
});

describe("scaleItem", () => {
  it("scales macros proportionally to the new portion", () => {
    expect(scaleItem(egg, 100)).toMatchObject({
      grams: 100,
      calories: 144,
      protein: 12.6,
      fat: 9.6,
      carbs: 0.8,
    });
  });

  it("rounds to one decimal", () => {
    expect(scaleItem(egg, 33).protein).toBe(4.2);
  });

  it("does not mutate the original item", () => {
    scaleItem(egg, 200);
    expect(egg.grams).toBe(50);
  });
});
