"use client";

import { useAppStore, type PipelineStep } from "@/lib/store/app.store";
import { CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";
import { cn, msToSeconds } from "@/lib/utils";
import { useEffect, useRef } from "react";

function StepRow({ step }: { step: PipelineStep }) {
  const isActive  = step.status === "active";
  const isDone    = step.status === "done";
  const isError   = step.status === "error";
  const isPending = step.status === "pending";

  return (
    <div
      className={cn(
        "flex items-start gap-3 py-2 px-3 rounded-[8px] transition-all duration-300",
        isActive  && "bg-[#4FC4B8]/5",
        isError   && "bg-[#E05252]/5",
      )}
    >
      {/* Status icon */}
      <div className="mt-0.5 w-4 shrink-0 flex items-center justify-center">
        {isDone    && <CheckCircle2 size={14} className="text-[#4CAF7D]" />}
        {isActive  && <Loader2 size={14} className="text-[#4FC4B8] animate-spin-slow" />}
        {isError   && <XCircle size={14} className="text-[#E05252]" />}
        {isPending && <Circle size={14} className="text-[#2A2A38]" />}
      </div>

      {/* Label + duration */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "text-[13px] font-mono",
              isDone    && "text-neutral-300",
              isActive  && "text-[#4FC4B8] animate-step-pulse",
              isError   && "text-[#E05252]",
              isPending && "text-neutral-700",
            )}
            style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
          >
            {step.label}
          </span>
          {isDone && step.durationMs && (
            <span
              className="text-[11px] text-neutral-700 shrink-0"
              style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
            >
              {msToSeconds(step.durationMs)}
            </span>
          )}
          {isActive && (
            <span
              className="text-[11px] text-[#4FC4B8]/50 shrink-0 animate-step-pulse"
              style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
            >
              …
            </span>
          )}
        </div>

        {/* Log lines (done step only) */}
        {isDone && step.logLines.length > 0 && (
          <div className="mt-1 flex flex-col gap-0.5">
            {step.logLines.map((line, i) => (
              <span
                key={i}
                className="text-[11px] text-neutral-700"
                style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
              >
                {line}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PipelineMonitor() {
  const steps      = useAppStore((s) => s.pipeline.steps);
  const elapsedMs  = useAppStore((s) => s.pipeline.elapsedMs);
  const status     = useAppStore((s) => s.pipeline.status);
  const error      = useAppStore((s) => s.pipeline.error);
  const inputText  = useAppStore((s) => s.inputText);
  const logEndRef  = useRef<HTMLDivElement>(null);

  // Scroll log area to bottom as new lines appear
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  const doneCount   = steps.filter((s) => s.status === "done").length;
  const totalCount  = steps.length;
  const progressPct = (doneCount / totalCount) * 100;

  const elapsedSec  = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-[15px] font-medium text-neutral-100"
          >
            Processing
          </h2>
          {inputText && (
            <p
              className="text-[11px] text-neutral-600 mt-0.5 truncate max-w-[340px]"
              style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
            >
              &quot;{inputText}&quot;
            </p>
          )}
        </div>

        {status === "running" && (
          <div className="flex items-center gap-2">
            <span
              className="text-[12px] text-neutral-600"
              style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
            >
              {elapsedSec}s
            </span>
            <Loader2 size={14} className="text-[#4FC4B8] animate-spin-slow" />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-[2px] rounded-full bg-[#1E1E2A] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#4FC4B8] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-0.5" ref={logEndRef}>
        {steps.map((step) => (
          <StepRow key={step.id} step={step} />
        ))}
      </div>

      {/* Error state */}
      {status === "error" && error && (
        <div
          className="rounded-[8px] px-4 py-3 text-[12px] text-[#E05252]"
          style={{
            background: "rgba(224,82,82,0.07)",
            border: "1px solid rgba(224,82,82,0.15)",
            fontFamily: "var(--font-jetbrains, monospace)",
          }}
        >
          <span className="text-[#E05252]/60 mr-2">error</span>
          {error}
        </div>
      )}
    </div>
  );
}
