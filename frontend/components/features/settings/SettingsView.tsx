"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/app.store";
import { API_BASE_URL } from "@/lib/api/client";
import type { LlmModel } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const MODELS: { id: LlmModel; label: string; detail: string }[] = [
  { id: "openai", label: "OpenAI", detail: "GPT-4o" },
  { id: "anthropic", label: "Anthropic", detail: "Claude" },
];

const SAVED_FEEDBACK_MS = 2000;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-[10px] tracking-widest text-neutral-700 uppercase">
        {title}
      </h2>
      <div className="flex flex-col gap-3 rounded-xl border border-white/6 bg-surface-1 p-4">
        {children}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-neutral-600">{label}</span>
      <span className="font-mono text-[12px] text-neutral-700">{value}</span>
    </div>
  );
}

export function SettingsView() {
  const uid = useAppStore((s) => s.uid);
  const setUid = useAppStore((s) => s.setUid);
  const model = useAppStore((s) => s.model);
  const setModel = useAppStore((s) => s.setModel);
  const addNotification = useAppStore((s) => s.addNotification);

  const [uidInput, setUidInput] = useState(uid);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), SAVED_FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [saved]);

  const handleSaveUid = () => {
    const trimmed = uidInput.trim();
    if (!trimmed || trimmed === uid) return;
    setUid(trimmed);
    setSaved(true);
    addNotification({ type: "success", message: `Switched to @${trimmed}` });
  };

  const handleModelChange = (m: (typeof MODELS)[number]) => {
    setModel(m.id);
    addNotification({
      type: "success",
      message: `Model: ${m.label} ${m.detail}`,
    });
  };

  return (
    <div className="max-w-xl flex-1 overflow-y-auto p-6">
      <h1 className="mb-6 text-[15px] font-medium text-neutral-200">
        Settings
      </h1>

      <div className="flex flex-col gap-8">
        <Section title="User">
          <div>
            <label
              htmlFor="uid"
              className="mb-2 block text-[12px] text-neutral-500"
            >
              User ID
            </label>
            <div className="flex gap-2">
              <input
                id="uid"
                value={uidInput}
                onChange={(e) => setUidInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveUid()}
                onBlur={handleSaveUid}
                placeholder="default_user"
                className="flex-1 rounded-lg border border-white/8 bg-surface-3 px-3 py-2 font-mono text-[13px] text-neutral-200 transition-colors focus:border-accent/40 focus:outline-none"
              />
              <button
                onClick={handleSaveUid}
                className={cn(
                  "rounded-lg px-4 py-2 text-[12px] font-medium transition-all",
                  saved
                    ? "bg-success/15 text-success"
                    : "bg-accent text-canvas hover:bg-accent-hover",
                )}
              >
                {saved ? "✓ Saved" : "Save"}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-neutral-700">
              Last used user is remembered automatically.
            </p>
          </div>
        </Section>

        <Section title="LLM Model">
          <p className="text-[12px] text-neutral-500">
            Which model processes your food descriptions
          </p>
          <div className="flex gap-2">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModelChange(m)}
                aria-pressed={model === m.id}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-3",
                  "border text-[12px] font-medium transition-all",
                  model === m.id
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-white/7 bg-surface-3 text-neutral-500 hover:border-white/12 hover:text-neutral-300",
                )}
              >
                <span>{m.label}</span>
                <span
                  className={cn(
                    "text-[10px]",
                    model === m.id ? "text-accent/70" : "text-neutral-700",
                  )}
                >
                  {m.detail}
                </span>
                {model === m.id && (
                  <span className="mt-0.5 text-[9px] opacity-60">✓ active</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-700">
            OpenAI is the default. Anthropic support coming soon.
          </p>
        </Section>

        <Section title="API">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-neutral-500">Backend URL</span>
            <span className="font-mono text-[12px] text-neutral-400">
              {API_BASE_URL}
            </span>
          </div>
          <p className="text-[11px] text-neutral-700">
            Set <code className="text-neutral-600">NEXT_PUBLIC_API_URL</code> in{" "}
            <code className="text-neutral-600">.env.local</code> to change.
          </p>
        </Section>

        <Section title="About">
          <div className="flex flex-col gap-2">
            <InfoRow label="SayFit" value="alpha" />
            <InfoRow label="Pipeline" value="5 steps · FastAPI" />
            <InfoRow label="Frontend" value="Next.js · Tailwind" />
          </div>
        </Section>
      </div>
    </div>
  );
}
