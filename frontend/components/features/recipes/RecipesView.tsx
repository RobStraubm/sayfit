"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/app.store";
import { recipesApi } from "@/lib/api/recipes";
import type {
  RecipePreferences,
  RecipeSuggestion,
  RecipeSuggestResponse,
} from "@/lib/api/types";
import {
  ChefHat,
  Clock,
  ExternalLink,
  Flame,
  Loader2,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SourceOption = "spoonacular" | "kaggle" | "combo";
type TasteOption = "any" | "savory" | "sweet";

export function RecipesView() {
  const uid            = useAppStore((s) => s.uid);
  const addMeal        = useAppStore((s) => s.addMeal);
  const addNotification = useAppStore((s) => s.addNotification);

  // Filter state
  const [source, setSource]           = useState<SourceOption>("spoonacular");
  const [taste, setTaste]             = useState<TasteOption>("any");
  const [maxTime, setMaxTime]         = useState<string>("");
  const [fewIngredients, setFewIngredients] = useState(false);
  const [onHand, setOnHand]           = useState<string>("");

  // Result state
  const [loading, setLoading]         = useState(false);
  const [response, setResponse]       = useState<RecipeSuggestResponse | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [loggingId, setLoggingId]     = useState<string | null>(null);

  async function handleSuggest() {
    setLoading(true);
    setError(null);
    setResponse(null);

    const prefs: RecipePreferences = { taste };
    if (maxTime)        prefs.max_time_minutes = parseInt(maxTime, 10);
    if (fewIngredients) prefs.few_ingredients  = true;
    if (onHand.trim()) {
      prefs.ingredients = onHand.split(",").map((s) => s.trim()).filter(Boolean);
    }

    try {
      const data = await recipesApi.suggest(uid, { source, preferences: prefs });
      setResponse(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleLog(suggestion: RecipeSuggestion) {
    setLoggingId(suggestion.title);
    try {
      const meal = await recipesApi.logSuggestion(uid, {
        title: suggestion.title,
        portions: 1,
        nutrition: suggestion.nutrition,
      });
      addMeal(meal);
      addNotification({
        type: "success",
        message: `"${suggestion.title}" logged successfully`,
      });
    } catch (e: unknown) {
      addNotification({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to log recipe",
      });
    } finally {
      setLoggingId(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 gap-5 max-w-3xl mx-auto w-full">

      {/* Header */}
      <div>
        <h1 className="text-[15px] font-medium text-neutral-200 flex items-center gap-2">
          <ChefHat size={16} className="text-[#4FC4B8]" />
          Recipe Suggestions
        </h1>
        <p className="text-[11px] text-neutral-600 mt-0.5">
          Recipes matched to your remaining macro budget for today
        </p>
      </div>

      {/* Filters */}
      <div
        className="rounded-[14px] p-5 flex flex-col gap-4"
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-[10px] text-neutral-700 uppercase tracking-widest">
          Preferences
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-neutral-500">Source</label>
            <div className="flex gap-1">
              {(["spoonacular", "kaggle", "combo"] as SourceOption[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={cn(
                    "flex-1 text-[11px] py-1.5 rounded-[7px] capitalize transition-colors",
                    source === s
                      ? "bg-[#4FC4B8]/15 text-[#4FC4B8] border border-[#4FC4B8]/30"
                      : "text-neutral-600 border border-[rgba(255,255,255,0.06)] hover:text-neutral-400"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Taste */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-neutral-500">Taste</label>
            <div className="flex gap-1">
              {(["any", "savory", "sweet"] as TasteOption[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTaste(t)}
                  className={cn(
                    "flex-1 text-[11px] py-1.5 rounded-[7px] capitalize transition-colors",
                    taste === t
                      ? "bg-[#4FC4B8]/15 text-[#4FC4B8] border border-[#4FC4B8]/30"
                      : "text-neutral-600 border border-[rgba(255,255,255,0.06)] hover:text-neutral-400"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Max time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-neutral-500">Max time (min)</label>
            <input
              type="number"
              min={1}
              placeholder="No limit"
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              className={cn(
                "bg-transparent border border-[rgba(255,255,255,0.08)] rounded-[8px]",
                "px-3 py-1.5 text-[12px] text-neutral-300 placeholder:text-neutral-700",
                "focus:outline-none focus:border-[#4FC4B8]/40"
              )}
            />
          </div>

          {/* On-hand ingredients */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-neutral-500">Ingredients on hand</label>
            <input
              type="text"
              placeholder="chicken, rice, …"
              value={onHand}
              onChange={(e) => setOnHand(e.target.value)}
              className={cn(
                "bg-transparent border border-[rgba(255,255,255,0.08)] rounded-[8px]",
                "px-3 py-1.5 text-[12px] text-neutral-300 placeholder:text-neutral-700",
                "focus:outline-none focus:border-[#4FC4B8]/40"
              )}
            />
          </div>
        </div>

        {/* Few ingredients toggle + submit */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              role="checkbox"
              aria-checked={fewIngredients}
              onClick={() => setFewIngredients((v) => !v)}
              className={cn(
                "w-8 h-4 rounded-full transition-colors relative",
                fewIngredients ? "bg-[#4FC4B8]" : "bg-[rgba(255,255,255,0.08)]"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                  fewIngredients ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
            <span className="text-[12px] text-neutral-500">
              Max 5 ingredients
            </span>
          </label>

          <button
            onClick={handleSuggest}
            disabled={loading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-[9px] text-[12px] font-medium transition-all",
              "bg-[#4FC4B8] text-[#0A0A0F] hover:bg-[#6DCFC4]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "shadow-[0_0_16px_rgba(79,196,184,0.2)]"
            )}
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            {loading ? "Searching…" : "Get suggestions"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-[10px] px-4 py-3 text-[12px] text-red-400"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          {error}
        </div>
      )}

      {/* Remaining budget banner */}
      {response && (
        <div
          className="rounded-[10px] px-4 py-3 flex items-center gap-6"
          style={{ background: "rgba(79,196,184,0.06)", border: "1px solid rgba(79,196,184,0.12)" }}
        >
          <div className="flex items-center gap-1.5">
            <Flame size={13} className="text-[#4FC4B8]" />
            <span className="text-[11px] text-neutral-500">Remaining budget</span>
          </div>
          <div className="flex gap-4 ml-auto">
            {[
              { label: "kcal",    value: Math.round(response.remaining.calories) },
              { label: "protein", value: `${Math.round(response.remaining.protein)}g` },
              { label: "fat",     value: `${Math.round(response.remaining.fat)}g` },
              { label: "carbs",   value: `${Math.round(response.remaining.carbs)}g` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div
                  className="text-[13px] text-neutral-200"
                  style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                >
                  {value}
                </div>
                <div className="text-[10px] text-neutral-700">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state after search */}
      {response && response.suggestions.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-10 rounded-[12px]"
          style={{ border: "1px dashed rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}
        >
          <UtensilsCrossed size={28} className="text-neutral-700" />
          <p className="text-[13px] text-neutral-600">No recipes found</p>
          {response.message && (
            <p className="text-[11px] text-neutral-700 text-center max-w-xs">
              {response.message}
            </p>
          )}
        </div>
      )}

      {/* Recipe cards */}
      {response && response.suggestions.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] text-neutral-700 uppercase tracking-widest">
            {response.suggestions.length} suggestion{response.suggestions.length !== 1 ? "s" : ""}
          </p>
          {response.suggestions.map((recipe) => (
            <RecipeCard
              key={recipe.title}
              recipe={recipe}
              logging={loggingId === recipe.title}
              onLog={() => handleLog(recipe)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Recipe card ───────────────────────────────────────────────────────────────

interface RecipeCardProps {
  recipe: RecipeSuggestion;
  logging: boolean;
  onLog: () => void;
}

function RecipeCard({ recipe, logging, onLog }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-[14px] p-4 flex flex-col gap-3 transition-all"
      style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Fit score badge */}
        <div
          className="shrink-0 w-10 h-10 rounded-[10px] flex flex-col items-center justify-center"
          style={{ background: fitScoreBg(recipe.fit_score), border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span
            className="text-[13px] font-medium leading-none"
            style={{ color: fitScoreColor(recipe.fit_score), fontFamily: "var(--font-jetbrains, monospace)" }}
          >
            {Math.round(recipe.fit_score)}
          </span>
          <span className="text-[8px] text-neutral-700 mt-0.5">fit</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-neutral-200 font-medium leading-snug truncate">
            {recipe.title}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[11px] text-neutral-600">
              <Clock size={10} />
              {recipe.ready_in_minutes} min
            </span>
            <span className="text-[11px] text-neutral-700">
              {recipe.ingredient_count} ingredients
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-[4px] capitalize"
              style={{
                background: recipe.source === "spoonacular"
                  ? "rgba(79,196,184,0.08)"
                  : "rgba(155,109,204,0.08)",
                color: recipe.source === "spoonacular" ? "#4FC4B8" : "#9B6DCC",
              }}
            >
              {recipe.source}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {recipe.source_url && (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              title="View recipe"
              className="w-8 h-8 flex items-center justify-center rounded-[7px] text-neutral-600 hover:text-neutral-300 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <ExternalLink size={13} />
            </a>
          )}
          <button
            onClick={onLog}
            disabled={logging}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[11px] font-medium transition-all",
              "bg-[#4FC4B8]/10 text-[#4FC4B8] border border-[#4FC4B8]/20",
              "hover:bg-[#4FC4B8]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {logging ? <Loader2 size={11} className="animate-spin" /> : <Star size={11} />}
            Log
          </button>
        </div>
      </div>

      {/* Macro row */}
      <div
        className="flex gap-4 px-3 py-2 rounded-[8px]"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
      >
        {[
          { label: "kcal",    value: Math.round(recipe.nutrition.calories), color: "text-neutral-300" },
          { label: "protein", value: `${Math.round(recipe.nutrition.protein)}g`, color: "text-[#4FC4B8]" },
          { label: "fat",     value: `${Math.round(recipe.nutrition.fat)}g`,     color: "text-[#E8A040]" },
          { label: "carbs",   value: `${Math.round(recipe.nutrition.carbs)}g`,   color: "text-[#9B6DCC]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center min-w-[44px]">
            <span
              className={cn("text-[12px] font-medium", color)}
              style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
            >
              {value}
            </span>
            <span className="text-[10px] text-neutral-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Ingredients toggle */}
      {recipe.ingredients.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            {expanded ? "Hide ingredients" : `Show ingredients (${recipe.ingredients.length})`}
          </button>
          {expanded && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recipe.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="text-[11px] text-neutral-500 px-2 py-0.5 rounded-[5px]"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {ing}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fitScoreColor(score: number): string {
  if (score >= 75) return "#4FC4B8";
  if (score >= 50) return "#E8A040";
  return "#8888A0";
}

function fitScoreBg(score: number): string {
  if (score >= 75) return "rgba(79,196,184,0.08)";
  if (score >= 50) return "rgba(232,160,64,0.08)";
  return "rgba(136,136,160,0.06)";
}
