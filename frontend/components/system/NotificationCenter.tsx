"use client";

import { useAppStore } from "@/lib/store/app.store";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  success: <CheckCircle2 size={15} className="text-[#4CAF7D]" />,
  error:   <AlertCircle  size={15} className="text-[#E05252]" />,
  info:    <Info         size={15} className="text-[#5B9CF6]" />,
  warning: <AlertTriangle size={15} className="text-[#E8A040]" />,
};

const COLORS = {
  success: "border-[#4CAF7D]/20",
  error:   "border-[#E05252]/20",
  info:    "border-[#5B9CF6]/20",
  warning: "border-[#E8A040]/20",
};

export function NotificationCenter() {
  const notifications = useAppStore((s) => s.notifications);
  const remove        = useAppStore((s) => s.removeNotification);

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            "glass pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-[10px]",
            "min-w-[280px] max-w-[380px] animate-slide-up",
            COLORS[n.type]
          )}
        >
          <span className="mt-0.5 shrink-0">{ICONS[n.type]}</span>
          <span className="flex-1 text-[13px] text-neutral-100 leading-snug">
            {n.message}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {n.action && (
              <button
                onClick={n.action.onClick}
                className="text-[12px] text-accent-500 hover:text-accent-400 font-medium transition-colors"
              >
                {n.action.label}
              </button>
            )}
            <button
              onClick={() => remove(n.id)}
              className="text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
