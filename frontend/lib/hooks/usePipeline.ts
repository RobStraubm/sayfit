"use client";

import { useAppStore, type StepId } from "@/lib/store/app.store";
import { mealsApi } from "@/lib/api/meals";
import { sleep } from "@/lib/utils";

// Optimistic timing estimates (ms) — based on observed CLI timings
const STEP_TIMING: Record<StepId, { min: number; max: number }> = {
  extraction: { min: 1500, max: 4000  },
  ontology:   { min: 800,  max: 2500  },
  retrieval:  { min: 400,  max: 1200  },
  reranker:   { min: 8000, max: 20000 },
  database:   { min: 100,  max: 400   },
};

const STEP_ORDER: StepId[] = [
  "extraction",
  "ontology",
  "retrieval",
  "reranker",
  "database",
];

// Sample log lines per step (realistic terminal output)
const STEP_LOGS: Record<StepId, (text: string) => string[]> = {
  extraction: (text) => [
    `> parsing: "${text.slice(0, 40)}${text.length > 40 ? "…" : ""}"`,
    `> LLM extraction complete`,
  ],
  ontology:   () => [`> ontology model loaded`, `> category classification done`],
  retrieval:  () => [`> FAISS index queried`, `> top-k candidates retrieved`],
  reranker:   () => [`> LLM reranker: estimating portions`, `> macros calculated`],
  database:   () => [`> meal saved to SQLite`],
};

export function usePipeline() {
  const store = useAppStore();

  const runPipeline = async (text: string) => {
    const { uid, model } = store;
    store.setInputText(text);
    store.startPipeline();

    // Tick elapsed timer every 100ms
    const timerInterval = setInterval(() => store.tickElapsed(), 100);

    // Run optimistic step progression concurrently with the real API call
    const optimisticPromise = runOptimisticSteps(text);
    const apiPromise = mealsApi.log({ text, uid, model });

    try {
      const [meal] = await Promise.all([apiPromise, optimisticPromise]);
      clearInterval(timerInterval);

      // Ensure all steps show done
      STEP_ORDER.forEach((id) =>
        store.setPipelineStepDone(id, STEP_LOGS[id](text))
      );

      store.setPipelineResult(meal);
      return meal;
    } catch (err: unknown) {
      clearInterval(timerInterval);
      const msg = err instanceof Error ? err.message : "Pipeline failed";
      store.setPipelineError(msg);
      throw err;
    }
  };

  return { runPipeline };
}

async function runOptimisticSteps(text: string) {
  const store = useAppStore.getState();

  for (const id of STEP_ORDER) {
    store.setPipelineStepActive(id);
    const { min, max } = STEP_TIMING[id];
    const duration = min + Math.random() * (max - min);
    await sleep(duration);

    // Don't mark done if pipeline already failed
    const { pipeline } = useAppStore.getState();
    if (pipeline.status === "error") break;
    store.setPipelineStepDone(id, STEP_LOGS[id](text));
  }
}
