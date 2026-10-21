"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { X, Mic, Square, Loader2, Type } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { usePipeline } from "@/lib/hooks/usePipeline";
import { transcribeApi } from "@/lib/api/transcribe";
import { PipelineMonitor } from "./PipelineMonitor";
import { CorrectionPanel } from "./CorrectionPanel";
import { cn } from "@/lib/utils";

// ── Input Step ─────────────────────────────────────────────────
function InputStep() {
  const [text, setText]         = useState("");
  const inputMode               = useAppStore((s) => s.inputMode);
  const setInputMode            = (mode: "text" | "voice") =>
    useAppStore.getState().openLogFlow(mode);
  const { runPipeline }         = usePipeline();
  const addNotification         = useAppStore((s) => s.addNotification);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = text.trim().length >= 3 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await runPipeline(text.trim());
    } catch {
      addNotification({ type: "error", message: "Pipeline failed. Try again." });
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-medium text-neutral-100">Log a Meal</h2>
        <p className="text-[12px] text-neutral-600 mt-0.5">
          Describe what you ate in natural language
        </p>
      </div>

      {/* Mode toggle — Voice first */}
      <div
        className="flex rounded-lg p-0.5 gap-0.5"
        style={{ background: "#0D0D14" }}
      >
        {(["voice", "text"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[12px] transition-all",
              inputMode === mode
                ? "bg-[#1E1E2A] text-neutral-200"
                : "text-neutral-600 hover:text-neutral-400"
            )}
          >
            {mode === "voice" ? <Mic size={13} /> : <Type size={13} />}
            {mode === "voice" ? "Voice" : "Type"}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div
        className="rounded-[10px] p-3"
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)" }}
      >
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
          rows={3}
          className={cn(
            "w-full resize-none bg-transparent text-[13px] text-neutral-100",
            "placeholder:text-neutral-700 focus:outline-none leading-relaxed",
            "font-mono"
          )}
          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
          disabled={submitting}
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(255,255,255,0.05)]">
          <span className="text-[10px] text-neutral-700">
            ↵ to log · shift+↵ new line
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "px-4 py-1.5 rounded-md text-[12px] font-medium transition-all",
              canSubmit
                ? "bg-[#4FC4B8] text-[#0A0A0F] hover:bg-[#6DCFC4]"
                : "bg-[#1E1E2A] text-neutral-700 cursor-not-allowed"
            )}
          >
            {submitting ? "Processing…" : "Log →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Voice Step ────────────────────────────────────────────────
type VoicePhase = "idle" | "recording" | "transcribing" | "review";

function VoiceStep() {
  const [phase, setPhase]           = useState<VoicePhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed]       = useState(0);
  const [error, setError]           = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const streamRef        = useRef<MediaStream | null>(null);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);

  const openLogFlow     = useAppStore((s) => s.openLogFlow);
  const addNotification = useAppStore((s) => s.addNotification);
  const { runPipeline } = usePipeline();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = async () => {
    setError("");
    setTranscript("");
    setElapsed(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access denied. Allow microphone in browser settings.");
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    const mimeType =
      MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" :
      MediaRecorder.isTypeSupported("audio/webm")             ? "audio/webm" :
      MediaRecorder.isTypeSupported("audio/mp4")              ? "audio/mp4" :
      "";

    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setError("Your browser does not support audio recording. Please try Chrome or Firefox.");
      return;
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);

      const blobType = mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: blobType });
      setPhase("transcribing");

      try {
        const ext = blobType.includes("mp4") ? ".mp4" :
                    blobType.includes("ogg") ? ".ogg" : ".webm";
        const text = await transcribeApi.transcribe(blob, ext);
        setTranscript(text);
        setPhase("review");
      } catch {
        setError("Transcription failed. Try again.");
        setPhase("idle");
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setPhase("recording");

    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleSubmit = async () => {
    const text = transcript.trim();
    if (!text) return;
    try {
      await runPipeline(text);
    } catch {
      addNotification({ type: "error", message: "Pipeline failed. Try again." });
    }
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <div className="text-center">
        <h2 className="text-[16px] font-medium text-neutral-100">Voice Input</h2>
        <p className="text-[12px] text-neutral-600 mt-0.5">
          {phase === "idle"         && "Tap the mic and describe your meal"}
          {phase === "recording"    && "Recording… tap to stop"}
          {phase === "transcribing" && "Whisper is transcribing…"}
          {phase === "review"       && "Review the transcript, then log"}
        </p>
      </div>

      {/* Mic / Stop button — hidden during transcription */}
      {phase !== "transcribing" && (
        <div className="relative flex items-center justify-center">
          {phase === "recording" && (
            <>
              <div className="absolute w-24 h-24 rounded-full bg-[#4FC4B8]/10 animate-ping" />
              <div className="absolute w-20 h-20 rounded-full bg-[#4FC4B8]/08 animate-pulse" />
            </>
          )}
          <button
            onClick={phase === "recording" ? stopRecording : startRecording}
            disabled={phase === "review"}
            className="w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-all duration-150"
            style={{
              background: phase === "recording"
                ? "rgba(79,196,184,0.25)"
                : "rgba(79,196,184,0.12)",
              border: `2px solid rgba(79,196,184,${phase === "recording" ? "0.7" : "0.4"})`,
              boxShadow: phase === "recording"
                ? "0 0 32px rgba(79,196,184,0.45)"
                : "0 0 20px rgba(79,196,184,0.2)",
            }}
          >
            {phase === "recording"
              ? <Square size={20} className="text-[#4FC4B8]" />
              : <Mic size={26} className="text-[#4FC4B8]" />}
          </button>
        </div>
      )}

      {/* Elapsed timer */}
      {phase === "recording" && (
        <span className="text-[12px] text-neutral-500 font-mono tabular-nums">
          {fmt(elapsed)}
        </span>
      )}

      {/* Transcribing spinner */}
      {phase === "transcribing" && (
        <div className="flex items-center gap-3 py-4">
          <Loader2 size={20} className="text-[#4FC4B8] animate-spin" />
          <span className="text-[13px] text-neutral-400">Processing audio…</span>
        </div>
      )}

      {/* Editable transcript after Whisper returns */}
      {phase === "review" && (
        <div
          className="w-full rounded-[10px] p-3"
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <textarea
            autoFocus
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            className={cn(
              "w-full resize-none bg-transparent text-[13px] text-neutral-100",
              "placeholder:text-neutral-700 focus:outline-none leading-relaxed font-mono"
            )}
            style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
          />
          <p className="text-[10px] text-neutral-700 mt-1">Edit if needed, then tap Log →</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[12px] text-red-400 text-center">{error}</p>
      )}

      {/* Actions — review phase */}
      {phase === "review" && (
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={!transcript.trim()}
            className={cn(
              "w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all",
              transcript.trim()
                ? "bg-[#4FC4B8] text-[#0A0A0F] hover:bg-[#6DCFC4]"
                : "bg-[#1E1E2A] text-neutral-700 cursor-not-allowed"
            )}
          >
            Log →
          </button>
          <button
            onClick={startRecording}
            className={cn(
              "w-full py-2 rounded-lg text-[13px] font-medium transition-all",
              "bg-[#1E1E2A] text-neutral-400 hover:text-neutral-200",
              "border border-[rgba(255,255,255,0.07)]"
            )}
          >
            Re-record
          </button>
        </div>
      )}

      {/* Switch to text — only on idle */}
      {phase === "idle" && (
        <button
          onClick={() => openLogFlow("text")}
          className="text-[11px] text-neutral-700 hover:text-neutral-500 transition-colors"
        >
          Switch to text input
        </button>
      )}
    </div>
  );
}

// ── Confirmed Step ─────────────────────────────────────────────
function ConfirmedStep() {
  const closeLogFlow    = useAppStore((s) => s.closeLogFlow);
  const todayTotals     = useAppStore((s) => s.todayTotals);
  const profile         = useAppStore((s) => s.profile);

  useEffect(() => {
    const t = setTimeout(closeLogFlow, 3000);
    return () => clearTimeout(t);
  }, [closeLogFlow]);

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(76,175,125,0.12)",
          border: "1px solid rgba(76,175,125,0.25)",
        }}
      >
        <span className="text-[#4CAF7D] text-2xl">✓</span>
      </div>

      <div className="text-center">
        <p className="text-[16px] font-medium text-neutral-100">Meal saved</p>
        <p
          className="text-[13px] text-neutral-500 mt-1"
          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
        >
          {Math.round(todayTotals.calories).toLocaleString()} kcal today
          {profile &&
            ` · ${Math.round(Math.max(0, profile.kcal_daily - todayTotals.calories)).toLocaleString()} remaining`}
        </p>
      </div>

      <button
        onClick={closeLogFlow}
        className="text-[12px] text-neutral-600 hover:text-neutral-400 transition-colors"
      >
        Close
      </button>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────
export function LogFlowModal() {
  const logFlowOpen  = useAppStore((s) => s.logFlowOpen);
  const logStep      = useAppStore((s) => s.logStep);
  const pipeline     = useAppStore((s) => s.pipeline);
  const closeLogFlow = useAppStore((s) => s.closeLogFlow);
  const resetPipeline = useAppStore((s) => s.resetPipeline);

  const handleClose = useCallback(() => {
    if (pipeline.status === "running") return;
    closeLogFlow();
    resetPipeline();
  }, [pipeline.status, closeLogFlow, resetPipeline]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  if (!logFlowOpen) return null;

  const isRunning = pipeline.status === "running";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-90 animate-fade-in"
        style={{ background: "rgba(5,5,10,0.75)" }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed z-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-120 mx-4 animate-scale-in",
          "rounded-2xl p-6",
          "glass"
        )}
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {!isRunning && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-neutral-700 hover:text-neutral-400 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Content */}
        <div>
          {logStep === "input"      && <InputStep />}
          {logStep === "voice"      && <VoiceStep />}
          {logStep === "processing" && <PipelineMonitor />}
          {logStep === "reviewing"  && pipeline.result && (
            <CorrectionPanel meal={pipeline.result} />
          )}
          {logStep === "confirmed"  && <ConfirmedStep />}

          {logStep === "processing" && pipeline.status === "error" && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClose}
                className="text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
