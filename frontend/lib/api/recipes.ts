import { apiClient } from "./client";
import type {
  Meal,
  RecipeLogRequest,
  RecipeSuggestRequest,
  RecipeSuggestResponse,
} from "./types";

export const recipesApi = {
  /** POST /recipes/{uid}/suggest */
  suggest: async (
    uid: string,
    body: RecipeSuggestRequest,
  ): Promise<RecipeSuggestResponse> => {
    const res = await apiClient.post<RecipeSuggestResponse>(
      `/recipes/${uid}/suggest`,
      body,
    );
    return res.data;
  },

  /** POST /recipes/{uid}/log-suggestion */
  logSuggestion: async (uid: string, body: RecipeLogRequest): Promise<Meal> => {
    const res = await apiClient.post<Meal>(
      `/recipes/${uid}/log-suggestion`,
      body,
    );
    return res.data;
  },
};
