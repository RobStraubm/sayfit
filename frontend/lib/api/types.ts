export interface FoodItem {
  item_id: string;
  item_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  grams: number;
}

export interface Meal {
  meal_id: string;
  date_time: string;
  uid: string;
  items: FoodItem[];
}

/** LLM provider for the pipeline; the API treats anything but "openai" as Groq. */
export type LlmModel = "openai" | "anthropic";

export interface MealCreate {
  uid: string;
  text: string;
  model?: LlmModel;
}

export interface ItemPatch {
  meal_id: string;
  grams: number;
}

export interface ItemCreate {
  meal_id: string;
  item_name: string;
  grams: number;
}

export interface DailyMacros {
  meal_date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  meal_count: number;
}

export interface MealHistory {
  user_id: string;
  days: number;
  daily_breakdown: DailyMacros[];
  average_calories: number;
  average_protein: number;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

// ── Recipe suggestions ─────────────────────────────────────────

export interface RecipePreferences {
  target_calories?: number;
  taste?: "savory" | "sweet" | "any";
  max_time_minutes?: number;
  ingredients?: string[];
  few_ingredients?: boolean;
}

export interface RecipeSuggestRequest {
  source: "spoonacular" | "kaggle" | "combo";
  preferences?: RecipePreferences;
}

export type RecipeNutrition = MacroTotals;

export interface RecipeSuggestion {
  title: string;
  fit_score: number;
  scale_factor: number;
  ready_in_minutes: number;
  source_url: string;
  ingredients: string[];
  ingredient_count: number;
  source: "spoonacular" | "kaggle";
  nutrition: RecipeNutrition;
}

export interface RecipeSuggestResponse {
  remaining: RecipeNutrition;
  suggestions: RecipeSuggestion[];
  message?: string;
}

export interface RecipeLogRequest {
  title: string;
  portions: number;
  nutrition: RecipeNutrition;
}
