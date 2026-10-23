"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LlmModel, Meal } from "@/lib/api/types";

// Client and UI state only. Server data (meals, history) lives in TanStack Query.

// ── Pipeline step ──────────────────────────────────────────────
export type StepId =
  "extraction" | "ontology" | "retrieval" | "reranker" | "database";

export type StepStatus = "pending" | "active" | "done" | "error";

export interface PipelineStep {
  id: StepId;
  label: string;
  status: StepStatus;
  startedAt: number | null; // Date.now()
  doneAt: number | null;
  durationMs: number | null;
  logLines: string[];
}

const STEP_LABELS: Record<StepId, string> = {
  extraction: "Extracting food items",
  ontology: "Classifying food categories",
  retrieval: "Finding food matches",
  reranker: "Estimating portions & macros",
  database: "Saving to logbook",
};

export const STEP_ORDER = Object.keys(STEP_LABELS) as StepId[];

function initialSteps(): PipelineStep[] {
  return STEP_ORDER.map((id) => ({
    id,
    label: STEP_LABELS[id],
    status: "pending",
    startedAt: null,
    doneAt: null,
    durationMs: null,
    logLines: [],
  }));
}

export type PipelineStatus = "idle" | "running" | "reviewing" | "error";

export interface PipelineState {
  status: PipelineStatus;
  steps: PipelineStep[];
  startedAt: number | null;
  elapsedMs: number;
  result: Meal | null;
  error: string | null;
}

function initialPipeline(): PipelineState {
  return {
    status: "idle",
    steps: initialSteps(),
    startedAt: null,
    elapsedMs: 0,
    result: null,
    error: null,
  };
}

export type LogStep =
  "input" | "voice" | "processing" | "reviewing" | "confirmed";
export type InputMode = "text" | "voice";
export type NavId = "dashboard" | "history" | "recipes" | "settings";

// ── Notification ───────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

let notificationSeq = 0;

// ── Store ──────────────────────────────────────────────────────
interface AppState {
  // Persisted in localStorage
  uid: string;
  model: LlmModel;

  // Log flow
  logFlowOpen: boolean;
  logStep: LogStep;
  inputText: string;
  inputMode: InputMode;
  pipeline: PipelineState;

  // UI
  notifications: AppNotification[];
  activeNav: NavId;

  setUid: (uid: string) => void;
  setModel: (model: LlmModel) => void;

  openLogFlow: (mode?: InputMode) => void;
  closeLogFlow: () => void;
  setLogStep: (step: LogStep) => void;
  setInputText: (text: string) => void;

  startPipeline: () => void;
  setPipelineStepActive: (id: StepId) => void;
  setPipelineStepDone: (id: StepId, logLines?: string[]) => void;
  setPipelineResult: (meal: Meal) => void;
  setPipelineError: (msg: string) => void;
  tickElapsed: () => void;
  resetPipeline: () => void;

  addNotification: (n: Omit<AppNotification, "id">) => void;
  removeNotification: (id: string) => void;

  setActiveNav: (nav: NavId) => void;
}

function updateStep(
  steps: PipelineStep[],
  id: StepId,
  update: (step: PipelineStep) => PipelineStep,
): PipelineStep[] {
  return steps.map((step) => (step.id === id ? update(step) : step));
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      uid: "default_user",
      model: "openai",

      logFlowOpen: false,
      logStep: "input",
      inputText: "",
      inputMode: "voice",
      pipeline: initialPipeline(),

      notifications: [],
      activeNav: "dashboard",

      setUid: (uid) => set({ uid }),
      setModel: (model) => set({ model }),

      // ── Log flow ────────────────────────────────────────────────
      openLogFlow: (mode = "voice") =>
        set({
          logFlowOpen: true,
          logStep: mode === "voice" ? "voice" : "input",
          inputMode: mode,
          pipeline: initialPipeline(),
          inputText: "",
        }),
      closeLogFlow: () => set({ logFlowOpen: false }),
      setLogStep: (logStep) => set({ logStep }),
      setInputText: (inputText) => set({ inputText }),

      // ── Pipeline ────────────────────────────────────────────────
      startPipeline: () =>
        set({
          pipeline: {
            ...initialPipeline(),
            status: "running",
            startedAt: Date.now(),
          },
          logStep: "processing",
        }),

      setPipelineStepActive: (id) =>
        set((s) => ({
          pipeline: {
            ...s.pipeline,
            steps: updateStep(s.pipeline.steps, id, (step) => ({
              ...step,
              status: "active",
              startedAt: Date.now(),
            })),
          },
        })),

      setPipelineStepDone: (id, logLines = []) =>
        set((s) => {
          const now = Date.now();
          return {
            pipeline: {
              ...s.pipeline,
              steps: updateStep(s.pipeline.steps, id, (step) => ({
                ...step,
                status: "done",
                doneAt: now,
                durationMs: step.startedAt ? now - step.startedAt : null,
                logLines,
              })),
            },
          };
        }),

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
          return { pipeline: { ...s.pipeline, elapsedMs: Date.now() - start } };
        }),

      resetPipeline: () => set({ pipeline: initialPipeline(), inputText: "" }),

      // ── Notifications ───────────────────────────────────────────
      addNotification: (n) => {
        const id = String(++notificationSeq);
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

      setActiveNav: (activeNav) => set({ activeNav }),
    }),
    {
      name: "sayfit",
      partialize: ({ uid, model }) => ({ uid, model }),
      // Rehydrated in <Providers> after mount, so the first client render
      // matches the prerendered HTML.
      skipHydration: true,
    },
  ),
);

/** True once the persisted user and model have been loaded from localStorage. */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );
}
