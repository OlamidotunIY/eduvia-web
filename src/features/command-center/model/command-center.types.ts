import type { EduviaRole } from "@/shared/domain";

export type CommandMode = "discuss" | "orchestrate";

export type SessionAccent = "emerald" | "purple" | "blue" | "amber";

export type SessionIconKind =
  | "workflow"
  | "book"
  | "reports"
  | "calculator"
  | "users";

export type OrchestrationStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "paused";

export type ActiveSessionPhase =
  | "idle"
  | "listening"
  | "thinking"
  | "orchestrating"
  | "speaking"
  | "paused";

export interface ContextAttachment {
  id: string;
  label: string;
  category: "classroom" | "curriculum" | "lesson" | "assessment" | "students";
}

export interface OrchestrationStep {
  id: string;
  title: string;
  detail: string;
  module: string;
  status: OrchestrationStepStatus;
  durationLabel?: string;
}

export interface OrchestrationArtifact {
  id: string;
  label: string;
  targetRoute: string;
  meta: string;
}

export interface OrchestrationPlan {
  id: string;
  goal: string;
  summary: string;
  state: "awaiting_approval" | "running" | "paused" | "completed" | "stopped";
  steps: OrchestrationStep[];
  artifacts?: OrchestrationArtifact[];
}

export interface CommandMessage {
  id: string;
  role: "user" | "assistant";
  mode: CommandMode;
  content: string;
  timestamp: string;
  contexts?: ContextAttachment[];
  orchestration?: OrchestrationPlan;
  spokenNote?: string;
}

export interface CommandThread {
  id: string;
  title: string;
  subtitle: string;
  kind: CommandMode;
  project?: string;
  accent: SessionAccent;
  iconKind: SessionIconKind;
  preview: string;
  updatedAt: string;
  statusLabel?: string;
  isRunning?: boolean;
  isPaused?: boolean;
  pinned?: boolean;
  contexts: ContextAttachment[];
  messages: CommandMessage[];
}

export interface AIModelOption {
  id: string;
  name: string;
  tier: string;
  badge?: string;
}

export interface QuickCommandPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  mode: CommandMode;
  accent: SessionAccent;
  iconKind: SessionIconKind;
  contexts: ContextAttachment[];
  roles?: EduviaRole[];
}

export interface LiveHudState {
  threadId: string;
  phase: Exclude<ActiveSessionPhase, "idle">;
  title: string;
  activeStepLabel: string;
  spokenTranscript: string;
  completedSteps: number;
  totalSteps: number;
  voiceMuted: boolean;
  steps: OrchestrationStep[];
}
