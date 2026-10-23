"use client";

import { useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { cn } from "@/lib/utils";
import { ConfirmedStep } from "./ConfirmedStep";
import { CorrectionPanel } from "./CorrectionPanel";
import { InputStep } from "./InputStep";
import { PipelineMonitor } from "./PipelineMonitor";
import { VoiceStep } from "./VoiceStep";

export function LogFlowModal() {
  const logFlowOpen = useAppStore((s) => s.logFlowOpen);
  const logStep = useAppStore((s) => s.logStep);
  const status = useAppStore((s) => s.pipeline.status);
  const result = useAppStore((s) => s.pipeline.result);
  const closeLogFlow = useAppStore((s) => s.closeLogFlow);
  const resetPipeline = useAppStore((s) => s.resetPipeline);

  const isRunning = status === "running";

  const handleClose = useCallback(() => {
    if (isRunning) return;
    closeLogFlow();
    resetPipeline();
  }, [isRunning, closeLogFlow, resetPipeline]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  if (!logFlowOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-90 animate-fade-in bg-[rgba(5,5,10,0.75)]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Log a meal"
        className={cn(
          "fixed top-1/2 left-1/2 z-100 -translate-x-1/2 -translate-y-1/2",
          "mx-4 w-full max-w-120 animate-scale-in",
          "rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)] glass",
        )}
      >
        {!isRunning && (
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-neutral-700 transition-colors hover:text-neutral-400"
          >
            <X size={16} />
          </button>
        )}

        {logStep === "input" && <InputStep />}
        {logStep === "voice" && <VoiceStep />}
        {logStep === "processing" && <PipelineMonitor />}
        {logStep === "reviewing" && result && <CorrectionPanel meal={result} />}
        {logStep === "confirmed" && <ConfirmedStep />}

        {logStep === "processing" && status === "error" && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClose}
              className="text-[13px] text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}
