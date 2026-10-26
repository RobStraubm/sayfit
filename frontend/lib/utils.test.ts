import { describe, expect, it } from "vitest";
import {
  errorMessage,
  formatGrams,
  formatTime,
  isOver,
  msToSeconds,
  pct,
} from "./utils";

describe("pct", () => {
  it("returns the share of the target in percent", () => {
    expect(pct(50, 200)).toBe(25);
  });

  it("clamps at 100", () => {
    expect(pct(300, 200)).toBe(100);
  });

  it("returns 0 without a target", () => {
    expect(pct(50, 0)).toBe(0);
  });
});

describe("isOver", () => {
  it("is true only above a positive target", () => {
    expect(isOver(201, 200)).toBe(true);
    expect(isOver(200, 200)).toBe(false);
    expect(isOver(50, 0)).toBe(false);
  });
});

describe("formatting", () => {
  it("formats durations, grams and times", () => {
    expect(msToSeconds(12_640)).toBe("12.6s");
    expect(formatGrams(149.6)).toBe("150g");
    expect(formatTime("2026-10-23T08:15:00")).toBe("08:15");
  });
});

describe("errorMessage", () => {
  it("appends the reason from the error", () => {
    expect(errorMessage(new Error("timeout"), "Pipeline failed")).toBe(
      "Pipeline failed: timeout",
    );
  });

  it("falls back when there is no reason", () => {
    expect(errorMessage("boom", "Pipeline failed")).toBe("Pipeline failed");
    expect(errorMessage(new Error(""), "Pipeline failed")).toBe(
      "Pipeline failed",
    );
  });
});
