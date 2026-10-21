"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/app.store";
import { cn } from "@/lib/utils";

const MODELS = [
  { id: "openai",    label: "OpenAI",    detail: "GPT-4o" },
  { id: "anthropic", label: "Anthropic", detail: "Claude" },
] as const;

export function SettingsView() {
  const uid       = useAppStore((s) => s.uid);
  const setUid    = useAppStore((s) => s.setUid);
  const model     = useAppStore((s) => s.model);
  const setModel  = useAppStore((s) => s.setModel);
  const addNotification = useAppStore((s) => s.addNotification);

  const [uidInput, setUidInput] = useState(uid);
  const [saved, setSaved] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const handleSaveUid = () => {
    const trimmed = uidInput.trim();
    if (!trimmed || trimmed === uid) return;
    setUid(trimmed);
    setSaved(true);
    addNotification({ type: "success", message: `Switched to @${trimmed}` });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleModelChange = (id: string) => {
    setModel(id);
    const m = MODELS.find((m) => m.id === id);
    if (m) addNotification({ type: "success", message: `Model: ${m.label} ${m.detail}` });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-[15px] font-medium text-neutral-200">Settings</h1>
      </div>

      <div className="flex flex-col gap-8">
        {/* User section */}
        <section>
          <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-3">
            User
          </p>
          <div
            className="rounded-xl p-4 flex flex-col gap-4"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <label className="text-[12px] text-neutral-500 block mb-2">
                User ID
              </label>
              <div className="flex gap-2">
                <input
                  value={uidInput}
                  onChange={(e) => setUidInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveUid()}
                  onBlur={handleSaveUid}
                  className={cn(
                    "flex-1 bg-[#1E1E2A] rounded-lg px-3 py-2 text-[13px] text-neutral-200",
                    "border border-[rgba(255,255,255,0.08)] focus:outline-none focus:border-[#4FC4B8]/40",
                    "transition-colors"
                  )}
                  style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                  placeholder="default_user"
                />
                <button
                  onClick={handleSaveUid}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[12px] font-medium transition-all",
                    saved
                      ? "bg-[#4CAF7D]/15 text-[#4CAF7D]"
                      : "bg-[#4FC4B8] text-[#0A0A0F] hover:bg-[#6DCFC4]"
                  )}
                >
                  {saved ? "✓ Saved" : "Save"}
                </button>
              </div>
              <p className="text-[11px] text-neutral-700 mt-2">
                Last used user is remembered automatically.
              </p>
            </div>
          </div>
        </section>

        {/* Model section */}
        <section>
          <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-3">
            LLM Model
          </p>
          <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-[12px] text-neutral-500">
              Which model processes your food descriptions
            </p>
            <div className="flex gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModelChange(m.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 py-3 px-2 rounded-lg",
                    "text-[12px] font-medium transition-all border",
                    model === m.id
                      ? "bg-[#4FC4B8]/10 border-[#4FC4B8]/40 text-[#4FC4B8]"
                      : "bg-[#1E1E2A] border-[rgba(255,255,255,0.07)] text-neutral-500 hover:text-neutral-300 hover:border-[rgba(255,255,255,0.12)]"
                  )}
                >
                  <span>{m.label}</span>
                  <span className={cn(
                    "text-[10px]",
                    model === m.id ? "text-[#4FC4B8]/70" : "text-neutral-700"
                  )}>
                    {m.detail}
                  </span>
                  {model === m.id && (
                    <span className="text-[9px] mt-0.5 opacity-60">✓ active</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-700">
              OpenAI is the default. Anthropic support coming soon.
            </p>
          </div>
        </section>

        {/* API section */}
        <section>
          <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-3">
            API
          </p>
          <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-neutral-500">Backend URL</span>
              <span
                className="text-[12px] text-neutral-400"
                style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
              >
                {apiUrl}
              </span>
            </div>
            <p className="text-[11px] text-neutral-700">
              Set <code className="text-neutral-600">NEXT_PUBLIC_API_URL</code> in{" "}
              <code className="text-neutral-600">.env.local</code> to change.
            </p>
          </div>
        </section>

        {/* About section */}
        <section>
          <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-3">
            About
          </p>
          <div
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-neutral-600">SayFit</span>
              <span
                className="text-[12px] text-neutral-700"
                style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
              >
                alpha
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-neutral-600">Pipeline</span>
              <span
                className="text-[12px] text-neutral-700"
                style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
              >
                5 steps · FastAPI
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-neutral-600">Frontend</span>
              <span
                className="text-[12px] text-neutral-700"
                style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
              >
                Next.js · Tailwind
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
