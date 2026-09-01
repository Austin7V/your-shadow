"use client";

import { useState } from "react";
import {
  SHADOW_STATES,
  ShadowOrb,
  type ShadowState,
} from "@/app/components/shadow/shadow-orb";

const stateLabels: Record<ShadowState, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
  responding: "Responding",
  success: "Success",
  attention: "Attention",
  offline: "Offline",
};

export function ShadowCompanionShowcase() {
  const [selectedState, setSelectedState] =
    useState<ShadowState>("idle");

  return (
    <section
      aria-labelledby="shadow-companion-title"
      className="motion-enter rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold text-primary">
          Aurora Companion
        </p>
        <h2
          id="shadow-companion-title"
          className="mt-1 text-xl font-bold"
        >
          Shadow companion states
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Visual and text states only. This showcase does not activate AI,
          audio, microphone access or network requests.
        </p>
      </div>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(18rem,1.1fr)]">
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-border bg-surface-muted p-6">
          <ShadowOrb state={selectedState} size="large" live />
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            Preview state
          </p>
          <div
            role="group"
            aria-label="Shadow preview state"
            className="mt-3 flex flex-wrap gap-2"
          >
            {SHADOW_STATES.map((state) => {
              const isSelected = selectedState === state;

              return (
                <button
                  key={state}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedState(state)}
                  className={`motion-press inline-flex min-h-11 items-center justify-center rounded-control border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  {stateLabels[state]}
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Continuous decorative motion stops under reduced-motion
            preferences while the icon, shape and accessible status remain.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 border-t border-border pt-6 sm:grid-cols-4 lg:grid-cols-7">
        {SHADOW_STATES.map((state) => (
          <div
            key={state}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface-muted p-3 text-center"
          >
            <ShadowOrb state={state} size="compact" />
            <span className="text-xs font-medium text-muted-foreground">
              {stateLabels[state]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
