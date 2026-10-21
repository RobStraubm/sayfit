import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  return new Date(iso).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
  return new Promise((r) => setTimeout(r, ms));
}
