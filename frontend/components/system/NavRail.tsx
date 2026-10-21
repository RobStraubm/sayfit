"use client";

import { useAppStore } from "@/lib/store/app.store";
import { LayoutDashboard, History, Settings, Plus, Zap, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "dashboard" as const, icon: LayoutDashboard, label: "Dashboard" },
  { id: "history"   as const, icon: History,         label: "History"   },
  { id: "recipes"   as const, icon: ChefHat,          label: "Recipes"   },
  { id: "settings"  as const, icon: Settings,         label: "Settings"  },
];

export function NavRail() {
  const activeNav  = useAppStore((s) => s.activeNav);
  const setNav     = useAppStore((s) => s.setActiveNav);
  const openLogFlow = useAppStore((s) => s.openLogFlow);

  return (
    <aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col items-center py-4 gap-2"
      style={{
        width: "var(--rail-width, 56px)",
        background: "#0D0D14",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo mark */}
      <div className="mb-4 flex items-center justify-center w-9 h-9 rounded-lg bg-[#4FC4B8]/10 border border-[#4FC4B8]/20">
        <Zap size={16} className="text-[#4FC4B8]" />
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setNav(id)}
            title={label}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150",
              activeNav === id
                ? "bg-[#4FC4B8]/15 text-[#4FC4B8]"
                : "text-[#8888A0] hover:text-[#E8E8F0] hover:bg-white/5"
            )}
          >
            <Icon size={18} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      {/* Quick Log button */}
      <button
        onClick={() => openLogFlow("text")}
        title="Log meal (⌘L)"
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150",
          "bg-[#4FC4B8] text-[#0A0A0F] hover:bg-[#6DCFC4]",
          "shadow-[0_0_16px_rgba(79,196,184,0.25)]"
        )}
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </aside>
  );
}
