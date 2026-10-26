import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { toApiError } from "./client";

function axiosError(
  data: unknown,
  message = "Request failed with status code 500",
) {
  const response = {
    data,
    status: 500,
    statusText: "Internal Server Error",
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse;
  return new AxiosError(
    message,
    "ERR_BAD_RESPONSE",
    undefined,
    undefined,
    response,
  );
}

describe("toApiError", () => {
  it("uses FastAPI's string detail", () => {
    expect(
      toApiError(axiosError({ detail: "No food items found" })).message,
    ).toBe("No food items found");
  });

  it("falls back to the transport message for validation errors", () => {
    const err = axiosError({
      detail: [{ loc: ["body", "text"], msg: "field required" }],
    });
    expect(toApiError(err).message).toBe("Request failed with status code 500");
  });

  it("passes plain errors through", () => {
    const err = new Error("offline");
    expect(toApiError(err)).toBe(err);
  });

  it("wraps unknown values", () => {
    expect(toApiError("nope").message).toBe("An unknown error occurred");
  });
});
