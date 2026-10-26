"use client";

import { useState } from "react";
import { Clock, ExternalLink, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeSuggestion } from "@/lib/api/types";

/** Badge colours for the 0–100 fit score. */
function fitScoreClasses(score: number): string {
  if (score >= 75) return "bg-accent/8 text-accent";
  if (score >= 50) return "bg-warning/8 text-warning";
  return "bg-fg-muted/6 text-fg-muted";
}

const SOURCE_CLASSES: Record<RecipeSuggestion["source"], string> = {
  spoonacular: "bg-accent/8 text-accent",
  kaggle: "bg-macro-carbs/8 text-macro-carbs",
};

interface RecipeCardProps {
  recipe: RecipeSuggestion;
  logging: boolean;
  onLog: () => void;
}

export function RecipeCard({ recipe, logging, onLog }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { nutrition } = recipe;

  const macros = [
    {
      label: "kcal",
      value: Math.round(nutrition.calories),
      color: "text-neutral-300",
    },
    {
      label: "protein",
      value: `${Math.round(nutrition.protein)}g`,
      color: "text-macro-protein",
    },
    {
      label: "fat",
      value: `${Math.round(nutrition.fat)}g`,
      color: "text-macro-fat",
    },
    {
      label: "carbs",
      value: `${Math.round(nutrition.carbs)}g`,
      color: "text-macro-carbs",
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-white/6 bg-surface-1 p-4 transition-all">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] border border-white/6",
            fitScoreClasses(recipe.fit_score),
          )}
        >
          <span className="font-mono text-[13px] leading-none font-medium">
            {Math.round(recipe.fit_score)}
          </span>
          <span className="mt-0.5 text-[8px] text-neutral-700">fit</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] leading-snug font-medium text-neutral-200">
            {recipe.title}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-neutral-600">
              <Clock size={10} />
              {recipe.ready_in_minutes} min
            </span>
            <span className="text-[11px] text-neutral-700">
              {recipe.ingredient_count} ingredients
            </span>
            <span
              className={cn(
                "rounded-[4px] px-1.5 py-0.5 text-[10px] capitalize",
                SOURCE_CLASSES[recipe.source],
              )}
            >
              {recipe.source}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {recipe.source_url && (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              title="View recipe"
              aria-label="View recipe"
              className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-white/6 text-neutral-600 transition-colors hover:text-neutral-300"
            >
              <ExternalLink size={13} />
            </a>
          )}
          <button
            onClick={onLog}
            disabled={logging}
            className="flex items-center gap-1.5 rounded-[7px] border border-accent/20 bg-accent/10 px-3 py-1.5 text-[11px] font-medium text-accent transition-all hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {logging ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Star size={11} />
            )}
            Log
          </button>
        </div>
      </div>

      <div className="flex gap-4 rounded-[8px] border border-white/4 bg-white/2 px-3 py-2">
        {macros.map(({ label, value, color }) => (
          <div key={label} className="flex min-w-[44px] flex-col items-center">
            <span className={cn("font-mono text-[12px] font-medium", color)}>
              {value}
            </span>
            <span className="text-[10px] text-neutral-700">{label}</span>
          </div>
        ))}
      </div>

      {recipe.ingredients.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="text-[11px] text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {expanded
              ? "Hide ingredients"
              : `Show ingredients (${recipe.ingredients.length})`}
          </button>
          {expanded && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recipe.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="rounded-[5px] border border-white/6 bg-white/3 px-2 py-0.5 text-[11px] text-neutral-500"
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
