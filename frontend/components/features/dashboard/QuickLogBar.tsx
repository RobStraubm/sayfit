"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Send, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { usePipeline } from "@/lib/hooks/usePipeline";
import { cn } from "@/lib/utils";

export function QuickLogBar() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const openLogFlow     = useAppStore((s) => s.openLogFlow);
  const addNotification = useAppStore((s) => s.addNotification);
  const { runPipeline } = usePipeline();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = text.trim().length >= 3 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      openLogFlow("text");
      await runPipeline(text.trim());
    } catch {
      addNotification({ type: "error", message: "Pipeline failed. Try again." });
    } finally {
      setSubmitting(false);
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-3"
      style={{ background: "#161620", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Primary CTA: Voice */}
      <button
        onClick={() => openLogFlow("voice")}
        className={cn(
          "w-full flex items-center justify-center gap-2.5 py-3 rounded-[10px]",
          "bg-[#4FC4B8] text-[#0A0A0F] hover:bg-[#6DCFC4] active:bg-[#3DAFA3]",
          "text-[13px] font-semibold transition-all duration-150",
          "shadow-[0_0_20px_rgba(79,196,184,0.3)] hover:shadow-[0_0_28px_rgba(79,196,184,0.45)]"
        )}
      >
        <Mic size={16} />
        Tap to speak
      </button>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        <span className="text-[10px] text-neutral-700 tracking-wider">or type</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* Secondary: Text input */}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 2 scrambled eggs and a banana"
          rows={2}
          disabled={submitting}
          className={cn(
            "flex-1 resize-none bg-transparent text-[13px] text-neutral-100",
            "placeholder:text-neutral-700 focus:outline-none leading-relaxed",
            submitting && "opacity-50"
          )}
          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
        />

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150",
            canSubmit
              ? "bg-[#1E1E2A] text-[#4FC4B8] hover:bg-[#4FC4B8]/15 border border-[#4FC4B8]/30"
              : "bg-[#1E1E2A] text-neutral-700 cursor-not-allowed border border-transparent"
          )}
        >
          {submitting
            ? <Loader2 size={14} className="animate-spin-slow" />
            : <Send size={14} />}
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
