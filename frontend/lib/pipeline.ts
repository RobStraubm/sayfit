import { useAppStore, STEP_ORDER, type StepId } from "@/lib/store/app.store";
import { mealsApi } from "@/lib/api/meals";
import type { Meal } from "@/lib/api/types";
import { sleep } from "@/lib/utils";

// POST /log runs all five pipeline steps in one request and reports no progress.
// While it runs, the UI advances through the steps on estimated timings
// (measured with the CLI) so the user sees what is happening.
const STEP_TIMING: Record<StepId, { min: number; max: number }> = {
  extraction: { min: 1500, max: 4000 },
  ontology: { min: 800, max: 2500 },
  retrieval: { min: 400, max: 1200 },
  reranker: { min: 8000, max: 20000 },
  database: { min: 100, max: 400 },
};

// Illustrative log lines per step, not output from the API.
const STEP_LOGS: Record<StepId, (text: string) => string[]> = {
  extraction: (text) => [
    `> parsing: "${text.slice(0, 40)}${text.length > 40 ? "…" : ""}"`,
    `> LLM extraction complete`,
  ],
  ontology: () => [`> ontology model loaded`, `> category classification done`],
  retrieval: () => [`> FAISS index queried`, `> top-k candidates retrieved`],
  reranker: () => [
    `> LLM reranker: estimating portions`,
    `> macros calculated`,
  ],
  database: () => [`> meal saved to SQLite`],
};

/**
 * Runs the meal pipeline for `text` and mirrors its progress in the store.
 * Resolves with the saved meal; rejects (after recording the error) on failure.
 */
export async function runPipeline(text: string): Promise<Meal> {
  const store = useAppStore.getState();
  const { uid, model } = store;
  store.setInputText(text);
  store.startPipeline();

  const timer = setInterval(() => useAppStore.getState().tickElapsed(), 100);
  try {
    const [meal] = await Promise.all([
      mealsApi.log({ text, uid, model }),
      advanceEstimatedSteps(text),
    ]);
    for (const id of STEP_ORDER) {
      store.setPipelineStepDone(id, STEP_LOGS[id](text));
    }
    store.setPipelineResult(meal);
    return meal;
  } catch (err) {
    store.setPipelineError(
      err instanceof Error ? err.message : "Pipeline failed",
    );
    throw err;
  } finally {
    clearInterval(timer);
  }
}

async function advanceEstimatedSteps(text: string) {
  const store = useAppStore.getState();
  for (const id of STEP_ORDER) {
    store.setPipelineStepActive(id);
    const { min, max } = STEP_TIMING[id];
    await sleep(min + Math.random() * (max - min));

    // Stop once the request has failed.
    if (useAppStore.getState().pipeline.status === "error") return;
    store.setPipelineStepDone(id, STEP_LOGS[id](text));
  }
}
