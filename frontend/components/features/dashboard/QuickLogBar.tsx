"use client";

import { useState } from "react";
import { Loader2, Mic, Send } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { runPipeline } from "@/lib/pipeline";
import { cn, errorMessage } from "@/lib/utils";

export function QuickLogBar() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openLogFlow = useAppStore((s) => s.openLogFlow);
  const addNotification = useAppStore((s) => s.addNotification);

  const canSubmit = text.trim().length >= 3 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      openLogFlow("text");
      await runPipeline(text.trim());
    } catch (err) {
      addNotification({
        type: "error",
        message: errorMessage(err, "Pipeline failed"),
      });
    } finally {
      setSubmitting(false);
      setText("");
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/7 bg-surface-2 p-3">
      {/* Primary CTA: voice */}
      <button
        onClick={() => openLogFlow("voice")}
        className={cn(
          "flex w-full items-center justify-center gap-2.5 rounded-[10px] py-3",
          "bg-accent text-canvas hover:bg-accent-hover active:bg-accent-active",
          "text-[13px] font-semibold transition-all duration-150",
          "shadow-[0_0_20px_rgba(79,196,184,0.3)] hover:shadow-[0_0_28px_rgba(79,196,184,0.45)]",
        )}
      >
        <Mic size={16} />
        Tap to speak
      </button>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white/6" />
        <span className="text-[10px] tracking-wider text-neutral-700">
          or type
        </span>
        <div className="h-px flex-1 bg-white/6" />
      </div>

      {/* Secondary: text input */}
      <div className="flex items-end gap-2">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="e.g. 2 scrambled eggs and a banana"
          aria-label="Describe your meal"
          rows={2}
          disabled={submitting}
          className={cn(
            "flex-1 resize-none bg-transparent font-mono text-[13px] text-neutral-100",
            "leading-relaxed placeholder:text-neutral-700 focus:outline-none",
            submitting && "opacity-50",
          )}
        />

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="Log meal"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg bg-surface-3 transition-all duration-150",
            canSubmit
              ? "border border-accent/30 text-accent hover:bg-accent/15"
              : "cursor-not-allowed border border-transparent text-neutral-700",
          )}
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin-slow" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-neutral-700">↵ to log</span>
        <span className="text-[10px] text-neutral-800">·</span>
        <span className="text-[10px] text-neutral-700">shift+↵ new line</span>
      </div>
    </div>
  );
}
