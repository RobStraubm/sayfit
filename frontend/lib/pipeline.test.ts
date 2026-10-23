import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runPipeline } from "./pipeline";
import { mealsApi } from "./api/meals";
import { useAppStore } from "./store/app.store";
import type { Meal } from "./api/types";

vi.mock("./api/meals", () => ({ mealsApi: { log: vi.fn() } }));

const meal: Meal = {
  meal_id: "m1",
  uid: "default_user",
  date_time: "",
  items: [],
};
const initialState = useAppStore.getState();

beforeEach(() => {
  useAppStore.setState(initialState, true);
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("runPipeline", () => {
  it("sends the text with user and model, then shows the result for review", async () => {
    vi.mocked(mealsApi.log).mockResolvedValue(meal);

    const run = runPipeline("two eggs");
    await vi.advanceTimersByTimeAsync(30_000);

    await expect(run).resolves.toBe(meal);
    expect(mealsApi.log).toHaveBeenCalledWith({
      text: "two eggs",
      uid: "default_user",
      model: "openai",
    });
    const { pipeline, logStep } = useAppStore.getState();
    expect(logStep).toBe("reviewing");
    expect(pipeline.result).toBe(meal);
    expect(pipeline.steps.every((s) => s.status === "done")).toBe(true);
  });

  it("records the error and rejects when the API fails", async () => {
    vi.mocked(mealsApi.log).mockRejectedValue(new Error("Groq rate limit"));

    const run = runPipeline("two eggs");
    const assertion = expect(run).rejects.toThrow("Groq rate limit");
    await vi.advanceTimersByTimeAsync(30_000);
    await assertion;

    const { pipeline } = useAppStore.getState();
    expect(pipeline).toMatchObject({
      status: "error",
      error: "Groq rate limit",
    });
    expect(pipeline.steps.some((s) => s.status === "done")).toBe(false);
  });
});
