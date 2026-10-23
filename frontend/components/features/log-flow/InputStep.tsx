"use client";

import { useState } from "react";
import { Mic, Type } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { runPipeline } from "@/lib/pipeline";
import { cn, errorMessage } from "@/lib/utils";

export function InputStep() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputMode = useAppStore((s) => s.inputMode);
  const openLogFlow = useAppStore((s) => s.openLogFlow);
  const addNotification = useAppStore((s) => s.addNotification);

  const canSubmit = text.trim().length >= 3 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await runPipeline(text.trim());
    } catch (err) {
      addNotification({
        type: "error",
        message: errorMessage(err, "Pipeline failed"),
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-medium text-neutral-100">Log a Meal</h2>
        <p className="mt-0.5 text-[12px] text-neutral-600">
          Describe what you ate in natural language
        </p>
      </div>

      {/* Mode toggle, voice first */}
      <div className="flex gap-0.5 rounded-lg bg-rail p-0.5">
        {(["voice", "text"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => openLogFlow(mode)}
            aria-pressed={inputMode === mode}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[12px] transition-all",
              inputMode === mode
                ? "bg-surface-3 text-neutral-200"
                : "text-neutral-600 hover:text-neutral-400",
            )}
          >
            {mode === "voice" ? <Mic size={13} /> : <Type size={13} />}
            {mode === "voice" ? "Voice" : "Type"}
          </button>
        ))}
      </div>

      <div className="rounded-[10px] border border-white/8 bg-surface-1 p-3">
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
          placeholder="e.g. 2 scrambled eggs, a banana and oat milk latte"
          aria-label="Describe your meal"
          rows={3}
          disabled={submitting}
          className="w-full resize-none bg-transparent font-mono text-[13px] leading-relaxed text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
          <span className="text-[10px] text-neutral-700">
            ↵ to log · shift+↵ new line
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "rounded-md px-4 py-1.5 text-[12px] font-medium transition-all",
              canSubmit
                ? "bg-accent text-canvas hover:bg-accent-hover"
                : "cursor-not-allowed bg-surface-3 text-neutral-700",
            )}
          >
            {submitting ? "Processing…" : "Log →"}
          </button>
        </div>
      </div>
    </div>
  );
}
