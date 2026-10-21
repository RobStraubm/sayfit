"use client";

import { create } from "zustand";
import type { Meal, MacroTotals, UserProfile } from "@/lib/api/types";

// ── Pipeline step ──────────────────────────────────────────────
export type StepId =
  | "extraction"
  | "ontology"
  | "retrieval"
  | "reranker"
  | "database";

export type StepStatus = "pending" | "active" | "done" | "error";

export interface PipelineStep {
  id: StepId;
  label: string;
  emoji: string;
  status: StepStatus;
  startedAt: number | null;    // Date.now()
  doneAt: number | null;
  durationMs: number | null;
  logLines: string[];
}

const DEFAULT_STEPS: PipelineStep[] = [
  { id: "extraction", label: "Extracting food items",         emoji: "✦", status: "pending", startedAt: null, doneAt: null, durationMs: null, logLines: [] },
  { id: "ontology",   label: "Classifying food categories",   emoji: "◈", status: "pending", startedAt: null, doneAt: null, durationMs: null, logLines: [] },
  { id: "retrieval",  label: "Finding food matches",          emoji: "◎", status: "pending", startedAt: null, doneAt: null, durationMs: null, logLines: [] },
  { id: "reranker",   label: "Estimating portions & macros",  emoji: "⟡", status: "pending", startedAt: null, doneAt: null, durationMs: null, logLines: [] },
  { id: "database",   label: "Saving to logbook",             emoji: "◉", status: "pending", startedAt: null, doneAt: null, durationMs: null, logLines: [] },
];

export type PipelineStatus =
  | "idle"
  | "running"
  | "reviewing"
  | "saving"
  | "done"
  | "error";

export type LogStep =
  | "input"
  | "voice"
  | "processing"
  | "reviewing"
  | "confirmed";

// ── Notification ───────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

// ── Store ──────────────────────────────────────────────────────
interface AppState {
  // User
  uid: string;
  profile: UserProfile | null;

  // Model
  model: string;

  // Today
  todayMeals: Meal[];
  todayTotals: MacroTotals;
  todayLoading: boolean;

  // Log Flow
  logFlowOpen: boolean;
  logStep: LogStep;
  inputText: string;
  inputMode: "text" | "voice";
  pipeline: {
    status: PipelineStatus;
    steps: PipelineStep[];
    startedAt: number | null;
    elapsedMs: number;
    result: Meal | null;
    error: string | null;
  };

  // UI
  notifications: AppNotification[];
  activeNav: "dashboard" | "history" | "recipes" | "settings";

  // ── Actions ──────────────────────────────────────────────────
  setUid: (uid: string) => void;
  setProfile: (p: UserProfile | null) => void;
  setModel: (model: string) => void;

  setTodayMeals: (meals: Meal[]) => void;
  setTodayLoading: (v: boolean) => void;
  computeTotals: () => void;

  openLogFlow: (mode?: "text" | "voice") => void;
  closeLogFlow: () => void;
  setLogStep: (step: LogStep) => void;
  setInputText: (text: string) => void;

  startPipeline: () => void;
  setPipelineStepActive: (id: StepId) => void;
  setPipelineStepDone: (id: StepId, logLines?: string[]) => void;
  setPipelineStepError: (id: StepId, msg: string) => void;
  setPipelineResult: (meal: Meal) => void;
  setPipelineError: (msg: string) => void;
  tickElapsed: () => void;
  resetPipeline: () => void;

  addMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;

  addNotification: (n: Omit<AppNotification, "id">) => void;
  removeNotification: (id: string) => void;

  setActiveNav: (nav: "dashboard" | "history" | "recipes" | "settings") => void;
}

function computeMacros(meals: Meal[]): MacroTotals {
  return meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        acc.calories += item.calories;
        acc.protein  += item.protein;
        acc.fat      += item.fat;
        acc.carbs    += item.carbs;
      });
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

export const useAppStore = create<AppState>((set, get) => ({
  uid: typeof window !== "undefined"
    ? localStorage.getItem("sayfit_uid") ?? "default_user"
    : "default_user",
  profile: null,

  model: typeof window !== "undefined"
    ? localStorage.getItem("sayfit_model") ?? "openai"
    : "openai",

  todayMeals: [],
  todayTotals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
  todayLoading: false,

  logFlowOpen: false,
  logStep: "input",
  inputText: "",
  inputMode: "voice",
  pipeline: {
    status: "idle",
    steps: DEFAULT_STEPS.map((s) => ({ ...s })),
    startedAt: null,
    elapsedMs: 0,
    result: null,
    error: null,
  },

  notifications: [],
  activeNav: "dashboard",

  // ── User ──────────────────────────────────────────────────────
  setUid: (uid) => {
    if (typeof window !== "undefined") localStorage.setItem("sayfit_uid", uid);
    set({ uid });
  },
  setProfile: (profile) => set({ profile }),
  setModel: (model) => {
    if (typeof window !== "undefined") localStorage.setItem("sayfit_model", model);
    set({ model });
  },

  // ── Today ─────────────────────────────────────────────────────
  setTodayMeals: (meals) => {
    const totals = computeMacros(meals);
    set({ todayMeals: meals, todayTotals: totals });
  },
  setTodayLoading: (v) => set({ todayLoading: v }),
  computeTotals: () => {
    const totals = computeMacros(get().todayMeals);
    set({ todayTotals: totals });
  },

  addMeal: (meal) => {
    const meals = [meal, ...get().todayMeals];
    const totals = computeMacros(meals);
    set({ todayMeals: meals, todayTotals: totals });
  },
  removeMeal: (mealId) => {
    const meals = get().todayMeals.filter((m) => m.meal_id !== mealId);
    const totals = computeMacros(meals);
    set({ todayMeals: meals, todayTotals: totals });
  },

  // ── Log Flow ──────────────────────────────────────────────────
  openLogFlow: (mode = "voice") => {
    set({ logFlowOpen: true, logStep: mode === "voice" ? "voice" : "input", inputMode: mode });
    get().resetPipeline();
  },
  closeLogFlow: () => set({ logFlowOpen: false }),
  setLogStep: (step) => set({ logStep: step }),
  setInputText: (text) => set({ inputText: text }),

  // ── Pipeline ──────────────────────────────────────────────────
  startPipeline: () =>
    set((s) => ({
      pipeline: {
        ...s.pipeline,
        status: "running",
        startedAt: Date.now(),
        elapsedMs: 0,
        steps: DEFAULT_STEPS.map((d) => ({ ...d })),
        result: null,
        error: null,
      },
      logStep: "processing",
    })),

  setPipelineStepActive: (id) =>
    set((s) => ({
      pipeline: {
        ...s.pipeline,
        steps: s.pipeline.steps.map((step) =>
          step.id === id
            ? { ...step, status: "active", startedAt: Date.now() }
            : step
        ),
      },
    })),

  setPipelineStepDone: (id, logLines = []) =>
    set((s) => {
      const now = Date.now();
      return {
        pipeline: {
          ...s.pipeline,
          steps: s.pipeline.steps.map((step) =>
            step.id === id
              ? {
                  ...step,
                  status: "done",
                  doneAt: now,
                  durationMs: step.startedAt ? now - step.startedAt : null,
                  logLines,
                }
              : step
          ),
        },
      };
    }),

  setPipelineStepError: (id, msg) =>
    set((s) => ({
      pipeline: {
        ...s.pipeline,
        steps: s.pipeline.steps.map((step) =>
          step.id === id
            ? { ...step, status: "error", logLines: [msg] }
            : step
        ),
      },
    })),

  setPipelineResult: (meal) =>
    set((s) => ({
      pipeline: { ...s.pipeline, status: "reviewing", result: meal },
      logStep: "reviewing",
    })),

  setPipelineError: (msg) =>
    set((s) => ({
      pipeline: { ...s.pipeline, status: "error", error: msg },
    })),

  tickElapsed: () =>
    set((s) => {
      const start = s.pipeline.startedAt;
      if (!start) return s;
      return {
        pipeline: { ...s.pipeline, elapsedMs: Date.now() - start },
      };
    }),

  resetPipeline: () =>
    set((s) => ({
      pipeline: {
        status: "idle",
        steps: DEFAULT_STEPS.map((d) => ({ ...d })),
        startedAt: null,
        elapsedMs: 0,
        result: null,
        error: null,
      },
      inputText: "",
    })),

  // ── Notifications ─────────────────────────────────────────────
  addNotification: (n) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ notifications: [...s.notifications, { ...n, id }] }));
    const duration = n.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => get().removeNotification(id), duration);
    }
  },
  removeNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  setActiveNav: (nav) => set({ activeNav: nav }),
}));
