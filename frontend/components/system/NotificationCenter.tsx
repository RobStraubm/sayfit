"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { useAppStore, type AppNotification } from "@/lib/store/app.store";
import { cn } from "@/lib/utils";

const ICONS: Record<AppNotification["type"], React.ReactNode> = {
  success: <CheckCircle2 size={15} className="text-success" />,
  error: <AlertCircle size={15} className="text-danger" />,
  info: <Info size={15} className="text-info" />,
  warning: <AlertTriangle size={15} className="text-warning" />,
};

const BORDERS: Record<AppNotification["type"], string> = {
  success: "border-success/20",
  error: "border-danger/20",
  info: "border-info/20",
  warning: "border-warning/20",
};

export function NotificationCenter() {
  const notifications = useAppStore((s) => s.notifications);
  const remove = useAppStore((s) => s.removeNotification);

  if (!notifications.length) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-6 bottom-6 z-200 flex flex-col gap-2"
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-[10px] px-4 py-3 glass",
            "max-w-[380px] min-w-[280px] animate-slide-up",
            BORDERS[n.type],
          )}
        >
          <span className="mt-0.5 shrink-0">{ICONS[n.type]}</span>
          <span className="flex-1 text-[13px] leading-snug text-neutral-100">
            {n.message}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {n.action && (
              <button
                onClick={n.action.onClick}
                className="text-[12px] font-medium text-accent transition-colors hover:text-accent-hover"
              >
                {n.action.label}
              </button>
            )}
            <button
              onClick={() => remove(n.id)}
              aria-label="Dismiss"
              className="text-neutral-600 transition-colors hover:text-neutral-400"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
