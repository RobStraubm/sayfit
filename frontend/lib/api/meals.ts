import { apiClient } from "./client";
import type {
  FoodItem,
  ItemCreate,
  ItemPatch,
  Meal,
  MealCreate,
  MealHistory,
} from "./types";

export const mealsApi = {
  /** POST /log — run pipeline + save to DB */
  log: async (payload: MealCreate): Promise<Meal> => {
    const res = await apiClient.post<Meal>("/log", payload);
    return res.data;
  },

  /** GET /meals/{uid}/today */
  getToday: async (uid: string): Promise<Meal[]> => {
    const res = await apiClient.get<Meal[]>(`/meals/${uid}/today`);
    return res.data;
  },

  /** GET /meals/{uid}?days=N */
  getHistory: async (uid: string, days = 30): Promise<MealHistory> => {
    const res = await apiClient.get<MealHistory>(`/meals/${uid}`, {
      params: { days },
    });
    return res.data;
  },

  /** PATCH /meals/{uid}/items/{item_id} */
  patchItem: async (
    uid: string,
    itemId: string,
    body: ItemPatch
  ): Promise<void> => {
    await apiClient.patch(`/meals/${uid}/items/${itemId}`, body);
  },

  /** DELETE /meals/{uid}/items/{item_id}?meal_id=... */
  deleteItem: async (
    uid: string,
    itemId: string,
    mealId: string
  ): Promise<void> => {
    await apiClient.delete(`/meals/${uid}/items/${itemId}`, {
      params: { meal_id: mealId },
    });
  },

  /** DELETE /meals/{uid}/{meal_id} */
  deleteMeal: async (uid: string, mealId: string): Promise<void> => {
    await apiClient.delete(`/meals/${uid}/${mealId}`);
  },

  /** POST /meals/{uid}/items */
  addItem: async (uid: string, body: ItemCreate): Promise<FoodItem> => {
    const res = await apiClient.post<FoodItem>(`/meals/${uid}/items`, body);
    return res.data;
  },
};
