"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { useAppStore, type PipelineStep } from "@/lib/store/app.store";
import { cn, msToSeconds } from "@/lib/utils";

function StepIcon({ status }: { status: PipelineStep["status"] }) {
  switch (status) {
    case "done":
      return <CheckCircle2 size={14} className="text-success" />;
    case "active":
      return <Loader2 size={14} className="animate-spin-slow text-accent" />;
    case "error":
      return <XCircle size={14} className="text-danger" />;
    case "pending":
      return <Circle size={14} className="text-surface-4" />;
  }
}

const LABEL_CLASSES: Record<PipelineStep["status"], string> = {
  done: "text-neutral-300",
  active: "animate-step-pulse text-accent",
  error: "text-danger",
  pending: "text-neutral-700",
};

function StepRow({ step }: { step: PipelineStep }) {
  const { status } = step;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[8px] px-3 py-2 transition-all duration-300",
        status === "active" && "bg-accent/5",
        status === "error" && "bg-danger/5",
      )}
    >
      <div className="mt-0.5 flex w-4 shrink-0 items-center justify-center">
        <StepIcon status={status} />
      </div>

      <div className="min-w-0 flex-1 font-mono">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn("text-[13px]", LABEL_CLASSES[status])}>
            {step.label}
          </span>
          {status === "done" && step.durationMs && (
            <span className="shrink-0 text-[11px] text-neutral-700">
              {msToSeconds(step.durationMs)}
            </span>
          )}
          {status === "active" && (
            <span className="shrink-0 animate-step-pulse text-[11px] text-accent/50">
              …
            </span>
          )}
        </div>

        {status === "done" && step.logLines.length > 0 && (
          <div className="mt-1 flex flex-col gap-0.5">
            {step.logLines.map((line, i) => (
              <span key={i} className="text-[11px] text-neutral-700">
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
  const { steps, elapsedMs, status, error } = useAppStore((s) => s.pipeline);
  const inputText = useAppStore((s) => s.inputText);

  const doneCount = steps.filter((s) => s.status === "done").length;
  const progressPct = (doneCount / steps.length) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-medium text-neutral-100">
            Processing
          </h2>
          {inputText && (
            <p className="mt-0.5 max-w-[340px] truncate font-mono text-[11px] text-neutral-600">
              &quot;{inputText}&quot;
            </p>
          )}
        </div>

        {status === "running" && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-neutral-600">
              {msToSeconds(elapsedMs)}
            </span>
            <Loader2 size={14} className="animate-spin-slow text-accent" />
          </div>
        )}
      </div>

      <div
        role="progressbar"
        aria-valuenow={doneCount}
        aria-valuemin={0}
        aria-valuemax={steps.length}
        className="h-[2px] overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-col gap-0.5">
        {steps.map((step) => (
          <StepRow key={step.id} step={step} />
        ))}
      </div>

      {status === "error" && error && (
        <div className="rounded-[8px] border border-danger/15 bg-danger/7 px-4 py-3 font-mono text-[12px] text-danger">
          <span className="mr-2 text-danger/60">error</span>
          {error}
        </div>
      )}
    </div>
  );
}
