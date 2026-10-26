import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Dates and times are shown in German format; numbers follow the browser locale. */
const DATE_LOCALE = "de-DE";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKcal(n: number): string {
  return Math.round(n).toLocaleString();
}

export function formatGrams(n: number): string {
  return `${Math.round(n)}g`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(DATE_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Share of `target` reached, clamped to 0–100. */
export function pct(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min((consumed / target) * 100, 100);
}

export function isOver(consumed: number, target: number): boolean {
  return target > 0 && consumed > target;
}

export function msToSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** User-facing error text: `fallback`, plus the API's reason when there is one. */
export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message
    ? `${fallback}: ${err.message}`
    : fallback;
}
