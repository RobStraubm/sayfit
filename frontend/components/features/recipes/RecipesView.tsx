"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ChefHat,
  Flame,
  Loader2,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { recipesApi } from "@/lib/api/recipes";
import { useAddMealToToday } from "@/lib/api/queries";
import { cn, errorMessage } from "@/lib/utils";
import type {
  RecipePreferences,
  RecipeSuggestion,
  RecipeSuggestRequest,
} from "@/lib/api/types";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { RecipeCard } from "./RecipeCard";

const SOURCES = ["spoonacular", "kaggle", "combo"] as const;
const TASTES = ["any", "savory", "sweet"] as const;

type Source = RecipeSuggestRequest["source"];
type Taste = NonNullable<RecipePreferences["taste"]>;

const textInputClass = cn(
  "rounded-[8px] border border-white/8 bg-transparent px-3 py-1.5 text-[12px] text-neutral-300",
  "placeholder:text-neutral-700 focus:border-accent/40 focus:outline-none",
);

export function RecipesView() {
  const uid = useAppStore((s) => s.uid);
  const addNotification = useAppStore((s) => s.addNotification);
  const addMealToToday = useAddMealToToday();

  const [source, setSource] = useState<Source>("spoonacular");
  const [taste, setTaste] = useState<Taste>("any");
  const [maxTime, setMaxTime] = useState("");
  const [fewIngredients, setFewIngredients] = useState(false);
  const [onHand, setOnHand] = useState("");
  const [loggingTitle, setLoggingTitle] = useState<string | null>(null);

  const suggest = useMutation({
    mutationFn: (preferences: RecipePreferences) =>
      recipesApi.suggest(uid, { source, preferences }),
  });

  const handleSuggest = () => {
    const prefs: RecipePreferences = { taste };
    if (maxTime) prefs.max_time_minutes = parseInt(maxTime, 10);
    if (fewIngredients) prefs.few_ingredients = true;
    if (onHand.trim()) {
      prefs.ingredients = onHand
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    suggest.mutate(prefs);
  };

  const handleLog = async (suggestion: RecipeSuggestion) => {
    setLoggingTitle(suggestion.title);
    try {
      const meal = await recipesApi.logSuggestion(uid, {
        title: suggestion.title,
        portions: 1,
        nutrition: suggestion.nutrition,
      });
      void addMealToToday(meal);
      addNotification({
        type: "success",
        message: `"${suggestion.title}" logged successfully`,
      });
    } catch (err) {
      addNotification({
        type: "error",
        message: errorMessage(err, "Failed to log recipe"),
      });
    } finally {
      setLoggingTitle(null);
    }
  };

  const response = suggest.data;

  return (
    <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
      <div>
        <h1 className="flex items-center gap-2 text-[15px] font-medium text-neutral-200">
          <ChefHat size={16} className="text-accent" />
          Recipe Suggestions
        </h1>
        <p className="mt-0.5 text-[11px] text-neutral-600">
          Recipes matched to your remaining macro budget for today
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-[14px] border border-white/6 bg-surface-1 p-5">
        <p className="text-[10px] tracking-widest text-neutral-700 uppercase">
          Preferences
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-neutral-500">Source</span>
            <SegmentedControl
              aria-label="Source"
              options={SOURCES}
              value={source}
              onChange={setSource}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-neutral-500">Taste</span>
            <SegmentedControl
              aria-label="Taste"
              options={TASTES}
              value={taste}
              onChange={setTaste}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-neutral-500">Max time (min)</span>
            <input
              type="number"
              min={1}
              placeholder="No limit"
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              className={textInputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-neutral-500">
              Ingredients on hand
            </span>
            <input
              type="text"
              placeholder="chicken, rice, …"
              value={onHand}
              onChange={(e) => setOnHand(e.target.value)}
              className={textInputClass}
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <button
              role="switch"
              aria-checked={fewIngredients}
              onClick={() => setFewIngredients((v) => !v)}
              className={cn(
                "relative h-4 w-8 rounded-full transition-colors",
                fewIngredients ? "bg-accent" : "bg-white/8",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform",
                  fewIngredients ? "translate-x-4" : "translate-x-0.5",
                )}
              />
            </button>
            <span className="text-[12px] text-neutral-500">
              Max 5 ingredients
            </span>
          </label>

          <button
            onClick={handleSuggest}
            disabled={suggest.isPending}
            className={cn(
              "flex items-center gap-2 rounded-[9px] px-4 py-2 text-[12px] font-medium transition-all",
              "bg-accent text-canvas hover:bg-accent-hover",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "shadow-[0_0_16px_rgba(79,196,184,0.2)]",
            )}
          >
            {suggest.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            {suggest.isPending ? "Searching…" : "Get suggestions"}
          </button>
        </div>
      </div>

      {suggest.isError && (
        <div className="rounded-[10px] border border-danger/15 bg-danger/8 px-4 py-3 text-[12px] text-danger">
          {suggest.error.message}
        </div>
      )}

      {response && (
        <div className="flex items-center gap-6 rounded-[10px] border border-accent/12 bg-accent/6 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Flame size={13} className="text-accent" />
            <span className="text-[11px] text-neutral-500">
              Remaining budget
            </span>
          </div>
          <div className="ml-auto flex gap-4">
            {[
              { label: "kcal", value: Math.round(response.remaining.calories) },
              {
                label: "protein",
                value: `${Math.round(response.remaining.protein)}g`,
              },
              { label: "fat", value: `${Math.round(response.remaining.fat)}g` },
              {
                label: "carbs",
                value: `${Math.round(response.remaining.carbs)}g`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="font-mono text-[13px] text-neutral-200">
                  {value}
                </div>
                <div className="text-[10px] text-neutral-700">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {response && response.suggestions.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-white/7 bg-white/1 py-10">
          <UtensilsCrossed size={28} className="text-neutral-700" />
          <p className="text-[13px] text-neutral-600">No recipes found</p>
          {response.message && (
            <p className="max-w-xs text-center text-[11px] text-neutral-700">
              {response.message}
            </p>
          )}
        </div>
      )}

      {response && response.suggestions.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] tracking-widest text-neutral-700 uppercase">
            {response.suggestions.length} suggestion
            {response.suggestions.length !== 1 ? "s" : ""}
          </p>
          {response.suggestions.map((recipe) => (
            <RecipeCard
              key={recipe.title}
              recipe={recipe}
              logging={loggingTitle === recipe.title}
              onLog={() => handleLog(recipe)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
