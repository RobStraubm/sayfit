"use client";

import {
  ChefHat,
  History,
  LayoutDashboard,
  Plus,
  Settings,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useAppStore, type NavId } from "@/lib/store/app.store";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { id: NavId; icon: LucideIcon; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "history", icon: History, label: "History" },
  { id: "recipes", icon: ChefHat, label: "Recipes" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function NavRail() {
  const activeNav = useAppStore((s) => s.activeNav);
  const setNav = useAppStore((s) => s.setActiveNav);
  const openLogFlow = useAppStore((s) => s.openLogFlow);

  return (
    <aside className="fixed top-0 left-0 z-50 flex h-full w-(--rail-width) flex-col items-center gap-2 border-r border-white/5 bg-rail py-4">
      {/* Logo mark */}
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
        <Zap size={16} className="text-accent" />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setNav(id)}
            title={label}
            aria-label={label}
            aria-current={activeNav === id ? "page" : undefined}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150",
              activeNav === id
                ? "bg-accent/15 text-accent"
                : "text-fg-muted hover:bg-white/5 hover:text-fg",
            )}
          >
            <Icon size={18} strokeWidth={1.5} />
          </button>
        ))}
      </nav>

      <button
        onClick={() => openLogFlow("text")}
        title="Log meal (⌘L)"
        aria-label="Log meal"
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-canvas shadow-[0_0_16px_rgba(79,196,184,0.25)] transition-all duration-150 hover:bg-accent-hover"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </aside>
  );
}
