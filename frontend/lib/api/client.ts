import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,          // pipeline can take up to 90s
  headers: { "Content-Type": "application/json" },
});

// Global error normalizer
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail =
      err?.response?.data?.detail ??
      err?.message ??
      "An unknown error occurred";
    return Promise.reject(new Error(detail));
  }
);
