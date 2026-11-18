import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock,
  Mic,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "cn";
import type { LiveHudState } from "../../model/command-center.types";

interface CommandCenterFloatingHudProps {
  hud: LiveHudState | null;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onReplyWithVoice: () => void;
  onStop: () => void;
}

const PHASE_BADGE: Record<
  LiveHudState["phase"],
  { label: string; dotClass: string }
> = {
  listening: {
    label: "Listening to you",
    dotClass: "bg-sky-400",
  },
  thinking: {
    label: "Synthesizing",
    dotClass: "bg-emerald-400",
  },
  orchestrating: {
    label: "Orchestrating live",
    dotClass: "bg-emerald-400",
  },
  speaking: {
    label: "Eduvia AI speaking",
    dotClass: "bg-emerald-400",
  },
  paused: {
    label: "Orchestration paused",
    dotClass: "bg-amber-400",
  },
};

export function CommandCenterFloatingHud({
  hud,
  onTogglePause,
  onToggleMute,
  onReplyWithVoice,
  onStop,
}: CommandCenterFloatingHudProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hud) return null;

  const isPaused = hud.phase === "paused";
  const isAnimating =
    !isPaused &&
    !hud.voiceMuted &&
    (hud.phase === "speaking" ||
      hud.phase === "listening" ||
      hud.phase === "orchestrating");

  const progressPercent =
    hud.totalSteps > 0
      ? Math.round((hud.completedSteps / hud.totalSteps) * 100)
      : 100;

  const badge = PHASE_BADGE[hud.phase];

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex justify-center md:inset-x-6">
      <div
        role="region"
        aria-label="Live AI voice and orchestration status"
        className="command-hud-enter pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-500/35 bg-card/95 dark:bg-[#0b1913]/95 shadow-xl backdrop-blur-md"
      >
        {/* Expandable Pipeline Drawer (opens above the main capsule row) */}
        {isExpanded && hud.steps.length > 0 ? (
          <div className="border-b border-border/50 bg-background/50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                Orchestration pipeline
              </span>
              <span className="tabular-nums">
                {hud.completedSteps} of {hud.totalSteps} completed
              </span>
            </div>
            <ul className="space-y-1.5">
              {hud.steps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-center justify-between gap-2.5 rounded-lg px-2 py-1 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {step.status === "completed" ? (
                      <CheckCircle2
                        className="size-3.5 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                    ) : step.status === "running" ? (
                      <CircleDot
                        className="size-3.5 shrink-0 text-emerald-400 motion-safe:animate-pulse"
                        aria-hidden="true"
                      />
                    ) : (
                      <Clock
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={cn(
                        "truncate",
                        step.status === "pending"
                          ? "text-muted-foreground"
                          : "font-medium text-foreground",
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  <span className="shrink-0 rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {step.module}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Main Floating Dynamic Capsule */}
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          {/* Sculpted Reactive AI Orb + Equalizer */}
          <div
            className={cn(
              "relative flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
              isPaused
                ? "border-amber-500/40 bg-amber-500/12 text-amber-500"
                : "border-emerald-500/40 bg-emerald-500/15 text-emerald-500 dark:bg-[#0f3424] dark:text-[#00c978]",
            )}
            aria-hidden="true"
          >
            <div className="flex h-4 items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  style={{ animationDelay: `${bar * 110}ms` }}
                  className={cn(
                    "w-0.5 rounded-full bg-current transition-transform",
                    isAnimating
                      ? "h-4 command-voice-bar"
                      : isPaused
                        ? "h-1.5 opacity-60"
                        : "h-2.5 opacity-85",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Live Status & Spoken Dialogue */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    badge.dotClass,
                    !isPaused && "motion-safe:animate-pulse",
                  )}
                  aria-hidden="true"
                />
                {badge.label}
              </span>

              <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                {hud.activeStepLabel}
              </span>
            </div>

            <p
              aria-live="polite"
              aria-atomic="true"
              className="mt-0.5 truncate text-xs text-foreground/90"
            >
              “{hud.spokenTranscript}”
            </p>
          </div>

          {/* Controls Cluster */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onReplyWithVoice}
              title="Talk back to Eduvia AI"
              className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-500/12 px-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-300 transition-transform hover:bg-emerald-500/20 active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <Mic className="size-3.5" aria-hidden="true" />
              <span>Reply</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-pressed={hud.voiceMuted}
              aria-label={hud.voiceMuted ? "Unmute AI audio" : "Mute AI audio"}
              title={hud.voiceMuted ? "Unmute AI audio" : "Mute AI audio"}
              className="flex size-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              {hud.voiceMuted ? (
                <VolumeX className="size-3.5" aria-hidden="true" />
              ) : (
                <Volume2 className="size-3.5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={onTogglePause}
              aria-label={isPaused ? "Resume orchestration" : "Pause orchestration"}
              title={isPaused ? "Resume" : "Pause"}
              className="flex size-8 items-center justify-center rounded-lg border border-border/40 text-foreground transition-transform hover:bg-muted/30 active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              {isPaused ? (
                <Play className="size-3.5 fill-current" aria-hidden="true" />
              ) : (
                <Pause className="size-3.5" aria-hidden="true" />
              )}
            </button>

            {hud.steps.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                aria-label={
                  isExpanded ? "Hide orchestration steps" : "Show orchestration steps"
                }
                title={isExpanded ? "Hide steps" : "Show steps"}
                className="flex size-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
              >
                {isExpanded ? (
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                ) : (
                  <ChevronUp className="size-3.5" aria-hidden="true" />
                )}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onStop}
              aria-label="Dismiss live AI bar"
              title="Dismiss"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Thin Progress Line along bottom edge */}
        {hud.totalSteps > 0 ? (
          <div className="h-0.5 w-full bg-muted/40">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
