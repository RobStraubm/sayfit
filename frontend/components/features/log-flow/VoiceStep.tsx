"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { transcribeApi } from "@/lib/api/transcribe";
import { runPipeline } from "@/lib/pipeline";
import { cn, errorMessage } from "@/lib/utils";

type VoicePhase = "idle" | "recording" | "transcribing" | "review";

const PHASE_HINTS: Record<VoicePhase, string> = {
  idle: "Tap the mic and describe your meal",
  recording: "Recording… tap to stop",
  transcribing: "Whisper is transcribing…",
  review: "Review the transcript, then log",
};

// In order of preference; Safari only records audio/mp4.
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function fileExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) return ".mp4";
  if (mimeType.includes("ogg")) return ".ogg";
  return ".webm";
}

function formatDuration(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function VoiceStep() {
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const openLogFlow = useAppStore((s) => s.openLogFlow);
  const addNotification = useAppStore((s) => s.addNotification);

  // Release the microphone if the modal closes mid-recording.
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
      setError(
        "Microphone access denied. Allow microphone in browser settings.",
      );
      return;
    }
    streamRef.current = stream;

    const mimeType = MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setError(
        "Your browser does not support audio recording. Please try Chrome or Firefox.",
      );
      return;
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);

      const blobType = mimeType ?? "audio/webm";
      setPhase("transcribing");
      try {
        const text = await transcribeApi.transcribe(
          new Blob(chunks, { type: blobType }),
          fileExtension(blobType),
        );
        setTranscript(text);
        setPhase("review");
      } catch (err) {
        setError(errorMessage(err, "Transcription failed"));
        setPhase("idle");
      }
    };

    recorderRef.current = recorder;
    recorder.start();
    setPhase("recording");
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  };

  const stopRecording = () => recorderRef.current?.stop();

  const handleSubmit = async () => {
    const text = transcript.trim();
    if (!text) return;
    try {
      await runPipeline(text);
    } catch (err) {
      addNotification({
        type: "error",
        message: errorMessage(err, "Pipeline failed"),
      });
    }
  };

  const recording = phase === "recording";

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <div className="text-center">
        <h2 className="text-[16px] font-medium text-neutral-100">
          Voice Input
        </h2>
        <p className="mt-0.5 text-[12px] text-neutral-600">
          {PHASE_HINTS[phase]}
        </p>
      </div>

      {/* Mic / stop button, hidden during transcription */}
      {phase !== "transcribing" && (
        <div className="relative flex items-center justify-center">
          {recording && (
            <>
              <div className="absolute h-24 w-24 animate-ping rounded-full bg-accent/10" />
              <div className="absolute h-20 w-20 animate-pulse rounded-full bg-accent/8" />
            </>
          )}
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={phase === "review"}
            aria-label={recording ? "Stop recording" : "Start recording"}
            className={cn(
              "relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-150",
              recording
                ? "border-accent/70 bg-accent/25 shadow-[0_0_32px_rgba(79,196,184,0.45)]"
                : "border-accent/40 bg-accent/12 shadow-[0_0_20px_rgba(79,196,184,0.2)]",
            )}
          >
            {recording ? (
              <Square size={20} className="text-accent" />
            ) : (
              <Mic size={26} className="text-accent" />
            )}
          </button>
        </div>
      )}

      {recording && (
        <span className="font-mono text-[12px] text-neutral-500 tabular-nums">
          {formatDuration(elapsed)}
        </span>
      )}

      {phase === "transcribing" && (
        <div className="flex items-center gap-3 py-4">
          <Loader2 size={20} className="animate-spin text-accent" />
          <span className="text-[13px] text-neutral-400">
            Processing audio…
          </span>
        </div>
      )}

      {/* Editable transcript after Whisper returns */}
      {phase === "review" && (
        <div className="w-full rounded-[10px] border border-white/8 bg-surface-1 p-3">
          <textarea
            autoFocus
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            aria-label="Transcript"
            rows={3}
            className="w-full resize-none bg-transparent font-mono text-[13px] leading-relaxed text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
          />
          <p className="mt-1 text-[10px] text-neutral-700">
            Edit if needed, then tap Log →
          </p>
        </div>
      )}

      {error && <p className="text-center text-[12px] text-danger">{error}</p>}

      {phase === "review" && (
        <div className="flex w-full flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={!transcript.trim()}
            className={cn(
              "w-full rounded-lg py-2.5 text-[13px] font-semibold transition-all",
              transcript.trim()
                ? "bg-accent text-canvas hover:bg-accent-hover"
                : "cursor-not-allowed bg-surface-3 text-neutral-700",
            )}
          >
            Log →
          </button>
          <button
            onClick={startRecording}
            className="w-full rounded-lg border border-white/7 bg-surface-3 py-2 text-[13px] font-medium text-neutral-400 transition-all hover:text-neutral-200"
          >
            Re-record
          </button>
        </div>
      )}

      {phase === "idle" && (
        <button
          onClick={() => openLogFlow("text")}
          className="text-[11px] text-neutral-700 transition-colors hover:text-neutral-500"
        >
          Switch to text input
        </button>
      )}
    </div>
  );
}
