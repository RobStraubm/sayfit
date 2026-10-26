import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000, // the meal pipeline can take up to 90 s
  headers: { "Content-Type": "application/json" },
});

/**
 * Turns any request failure into an `Error` whose message is readable:
 * FastAPI's string `detail` when there is one, otherwise the transport error.
 * Validation errors (422) carry a list as `detail` and fall back to the latter.
 */
export function toApiError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const detail: unknown = err.response?.data?.detail;
    return new Error(typeof detail === "string" ? detail : err.message);
  }
  return err instanceof Error ? err : new Error("An unknown error occurred");
}

apiClient.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(toApiError(err)),
);
