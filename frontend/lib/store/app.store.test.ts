// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "./app.store";
import type { Meal } from "@/lib/api/types";

const initialState = useAppStore.getState();
const store = () => useAppStore.getState();

beforeEach(() => {
  useAppStore.setState(initialState, true);
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("pipeline", () => {
  it("starts with all steps pending and switches to the processing step", () => {
    store().startPipeline();
    expect(store().logStep).toBe("processing");
    expect(store().pipeline.status).toBe("running");
    expect(store().pipeline.steps.every((s) => s.status === "pending")).toBe(
      true,
    );
  });

  it("records step duration and log lines", () => {
    vi.useFakeTimers();
    store().startPipeline();
    store().setPipelineStepActive("extraction");
    vi.advanceTimersByTime(1500);
    store().setPipelineStepDone("extraction", ["> done"]);

    const step = store().pipeline.steps.find((s) => s.id === "extraction");
    expect(step).toMatchObject({
      status: "done",
      durationMs: 1500,
      logLines: ["> done"],
    });
  });

  it("moves to review when the result arrives", () => {
    const meal: Meal = { meal_id: "m1", uid: "u", date_time: "", items: [] };
    store().startPipeline();
    store().setPipelineResult(meal);
    expect(store().logStep).toBe("reviewing");
    expect(store().pipeline).toMatchObject({
      status: "reviewing",
      result: meal,
    });
  });

  it("keeps the error message", () => {
    store().startPipeline();
    store().setPipelineError("Groq rate limit");
    expect(store().pipeline).toMatchObject({
      status: "error",
      error: "Groq rate limit",
    });
  });

  it("resets the pipeline when the log flow opens", () => {
    store().startPipeline();
    store().setInputText("eggs");
    store().openLogFlow("text");
    expect(store()).toMatchObject({
      logFlowOpen: true,
      logStep: "input",
      inputText: "",
    });
    expect(store().pipeline.status).toBe("idle");
  });
});

describe("notifications", () => {
  it("dismisses notifications after their duration", () => {
    vi.useFakeTimers();
    store().addNotification({
      type: "success",
      message: "Saved",
      duration: 1000,
    });
    expect(store().notifications).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(store().notifications).toHaveLength(0);
  });

  it("keeps notifications with duration 0", () => {
    vi.useFakeTimers();
    store().addNotification({ type: "error", message: "Failed", duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(store().notifications).toHaveLength(1);
  });
});

describe("persistence", () => {
  it("stores only the user and the model", () => {
    store().setUid("robert");
    store().setModel("anthropic");
    store().openLogFlow();

    const saved = JSON.parse(localStorage.getItem("sayfit") ?? "{}");
    expect(saved.state).toEqual({ uid: "robert", model: "anthropic" });
  });
});
