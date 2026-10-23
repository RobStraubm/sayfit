"use client";

import { useEffect } from "react";
import { useAppStore, type NavId } from "@/lib/store/app.store";
import { NavRail } from "./NavRail";
import { Dashboard } from "@/components/features/dashboard/Dashboard";
import { HistoryView } from "@/components/features/history/HistoryView";
import { RecipesView } from "@/components/features/recipes/RecipesView";
import { SettingsView } from "@/components/features/settings/SettingsView";

const VIEWS: Record<NavId, React.ComponentType> = {
  dashboard: Dashboard,
  history: HistoryView,
  recipes: RecipesView,
  settings: SettingsView,
};

// ⌘/Ctrl + key
const SHORTCUTS: Record<string, () => void> = {
  l: () => useAppStore.getState().openLogFlow("voice"),
  d: () => useAppStore.getState().setActiveNav("dashboard"),
  h: () => useAppStore.getState().setActiveNav("history"),
};

export function AppShell() {
  const activeNav = useAppStore((s) => s.activeNav);
  const View = VIEWS[activeNav];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = SHORTCUTS[e.key];
      if (!action || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      action();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-full pl-(--rail-width)">
      <NavRail />
      <main className="flex min-w-0 flex-1 overflow-hidden">
        <View />
      </main>
    </div>
  );
}
