"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useAppStore, useStoreHydrated } from "@/lib/store/app.store";
import { scaleItem, sumMacros } from "@/lib/macros";
import { mealsApi } from "./meals";
import type { FoodItem, Meal } from "./types";

declare module "@tanstack/react-query" {
  interface Register {
    // Shown as a notification when a query fails (see <Providers>).
    queryMeta: { errorMessage?: string };
  }
}

export const mealKeys = {
  all: (uid: string) => ["meals", uid] as const,
  today: (uid: string) => ["meals", uid, "today"] as const,
  history: (uid: string, days: number) =>
    ["meals", uid, "history", days] as const,
};

function useUid() {
  return useAppStore((s) => s.uid);
}

// ── Queries ────────────────────────────────────────────────────

export function useTodayMeals() {
  const uid = useUid();
  const hydrated = useStoreHydrated();
  return useQuery({
    queryKey: mealKeys.today(uid),
    queryFn: () => mealsApi.getToday(uid),
    enabled: hydrated,
    meta: { errorMessage: "Could not load today's meals" },
  });
}

export function useTodayTotals() {
  const { data: meals = [] } = useTodayMeals();
  return sumMacros(meals.flatMap((meal) => meal.items));
}

export function useMealHistory(days = 30) {
  const uid = useUid();
  const hydrated = useStoreHydrated();
  return useQuery({
    queryKey: mealKeys.history(uid, days),
    queryFn: () => mealsApi.getHistory(uid, days),
    enabled: hydrated,
    meta: { errorMessage: "Could not load history" },
  });
}

// ── Cache helpers ──────────────────────────────────────────────

function updateTodayMeals(
  queryClient: QueryClient,
  uid: string,
  update: (meals: Meal[]) => Meal[],
) {
  queryClient.setQueryData<Meal[]>(mealKeys.today(uid), (meals) =>
    meals ? update(meals) : meals,
  );
}

function updateItems(
  meals: Meal[],
  mealId: string,
  update: (items: FoodItem[]) => FoodItem[],
): Meal[] {
  return meals.map((meal) =>
    meal.meal_id === mealId ? { ...meal, items: update(meal.items) } : meal,
  );
}

/** Puts a freshly saved meal at the top of today's list, then refetches. */
export function useAddMealToToday() {
  const cache = useMealsCache();
  return (meal: Meal) => {
    cache.update((meals) => [meal, ...meals]);
    return cache.invalidate();
  };
}

// ── Mutations ──────────────────────────────────────────────────

function useMealsCache() {
  const uid = useUid();
  const queryClient = useQueryClient();
  return {
    uid,
    queryClient,
    update: (fn: (meals: Meal[]) => Meal[]) =>
      updateTodayMeals(queryClient, uid, fn),
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: mealKeys.all(uid) }),
  };
}

export function useUpdateGrams() {
  const cache = useMealsCache();
  return useMutation({
    mutationFn: (v: { mealId: string; itemId: string; grams: number }) =>
      mealsApi.patchItem(cache.uid, v.itemId, {
        meal_id: v.mealId,
        grams: v.grams,
      }),
    onSuccess: (_, v) =>
      cache.update((meals) =>
        updateItems(meals, v.mealId, (items) =>
          items.map((i) =>
            i.item_id === v.itemId ? scaleItem(i, v.grams) : i,
          ),
        ),
      ),
    onSettled: cache.invalidate,
  });
}

export function useAddItem() {
  const cache = useMealsCache();
  return useMutation({
    mutationFn: (v: { mealId: string; name: string; grams: number }) =>
      mealsApi.addItem(cache.uid, {
        meal_id: v.mealId,
        item_name: v.name,
        grams: v.grams,
      }),
    onSuccess: (item, v) =>
      cache.update((meals) =>
        updateItems(meals, v.mealId, (items) => [...items, item]),
      ),
    onSettled: cache.invalidate,
  });
}

/** Optimistic: the item disappears at once and comes back if the call fails. */
export function useDeleteItem() {
  const cache = useMealsCache();
  const todayKey = mealKeys.today(cache.uid);
  return useMutation({
    mutationFn: (v: { mealId: string; itemId: string }) =>
      mealsApi.deleteItem(cache.uid, v.itemId, v.mealId),
    onMutate: async (v) => {
      await cache.queryClient.cancelQueries({ queryKey: todayKey });
      const previous = cache.queryClient.getQueryData<Meal[]>(todayKey);
      cache.update((meals) =>
        updateItems(meals, v.mealId, (items) =>
          items.filter((i) => i.item_id !== v.itemId),
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) =>
      cache.queryClient.setQueryData(todayKey, context?.previous),
    onSettled: cache.invalidate,
  });
}

export function useDeleteMeal() {
  const cache = useMealsCache();
  return useMutation({
    mutationFn: (mealId: string) => mealsApi.deleteMeal(cache.uid, mealId),
    onSuccess: (_, mealId) =>
      cache.update((meals) => meals.filter((m) => m.meal_id !== mealId)),
    onSettled: cache.invalidate,
  });
}
