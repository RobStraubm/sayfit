"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/app.store";
import { NavRail } from "./NavRail";
import { Dashboard } from "@/components/features/dashboard/Dashboard";
import { HistoryView } from "@/components/features/history/HistoryView";
import { RecipesView } from "@/components/features/recipes/RecipesView";
import { SettingsView } from "@/components/features/settings/SettingsView";

export function AppShell() {
  const activeNav = useAppStore((s) => s.activeNav);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        useAppStore.getState().openLogFlow("voice");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        useAppStore.getState().setActiveNav("dashboard");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "h") {
        e.preventDefault();
        useAppStore.getState().setActiveNav("history");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="h-full flex"
      style={{ paddingLeft: "var(--rail-width, 56px)" }}
    >
      <NavRail />

      <main className="flex-1 flex min-w-0 overflow-hidden">
        {activeNav === "dashboard" && <Dashboard />}
        {activeNav === "history"   && <HistoryView />}
        {activeNav === "recipes"   && <RecipesView />}
        {activeNav === "settings"  && <SettingsView />}
      </main>
    </div>
  );
}
