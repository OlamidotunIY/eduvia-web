import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Search } from "lucide-react";
import { cn } from "cn";
import { useLayout } from "@/app/providers/layout-provider";
import { useMainHeaderSlot } from "@/app/shell/main/header";
import { sessionStore } from "@/shared/store";
import {
  AVAILABLE_MODELS,
  INITIAL_COMMAND_THREADS,
  getPromptsForRole,
} from "../../model/command-center.mock";
import type {
  AIModelOption,
  CommandMessage,
  CommandMode,
  CommandThread,
  ContextAttachment,
  OrchestrationStep,
  QuickCommandPrompt,
} from "../../model/command-center.types";
import { CommandCenterComposer } from "../components/command-center-composer";
import {
  CommandCenterHistory,
  type SessionFilterTab,
} from "../components/command-center-history";
import { CommandCenterThreadView } from "../components/command-center-thread";

function createStepsForPrompt(
  prompt: string,
  contexts: ContextAttachment[],
): OrchestrationStep[] {
  const scopeLabel = contexts[0]?.label ?? "Active Classrooms";
  const lower = prompt.toLowerCase();

  if (lower.includes("report") || lower.includes("parent")) {
    return [
      {
        id: `step-${Date.now()}-1`,
        title: `Audited recent Lesson Reports in ${scopeLabel}`,
        detail: "Reviewed participation notes, completion status, and exit scores.",
        module: "Lesson Reports",
        status: "running",
      },
      {
        id: `step-${Date.now()}-2`,
        title: "Grouped mastery trends across learners",
        detail: "Identified common concept bottlenecks from recent board work.",
        module: "Student Progress",
        status: "pending",
      },
      {
        id: `step-${Date.now()}-3`,
        title: "Drafted concise parent feedback notes",
        detail: "Prepared review-ready updates aligned with your teaching tone.",
        module: "Messages",
        status: "pending",
      },
      {
        id: `step-${Date.now()}-4`,
        title: "Prepared Monday recap checklist",
        detail: "Queued a 5-minute starter prompt for the next lesson.",
        module: "Calendar",
        status: "pending",
      },
    ];
  }

  return [
    {
      id: `step-${Date.now()}-1`,
      title: `Loaded curriculum scope for ${scopeLabel}`,
      detail: "Aligned pacing targets and upcoming lesson objectives.",
      module: "Curriculum",
      status: "running",
    },
    {
      id: `step-${Date.now()}-2`,
      title: "Generated tailored problems & worked examples",
      detail: "Balanced conceptual warm-ups with progressive practice prompts.",
      module: "Question Bank",
      status: "pending",
    },
    {
      id: `step-${Date.now()}-3`,
      title: "Staged materials for the Learning Board",
      detail: "Queued interactive prompts so you can insert them mid-lesson.",
      module: "Learning Board",
      status: "pending",
    },
    {
      id: `step-${Date.now()}-4`,
      title: "Synced schedule summary and teaching notes",
      detail: "Updated session timeline ready for review before class starts.",
      module: "Calendar",
      status: "pending",
    },
  ];
}

function nowTimeLabel(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommandCenterPage() {
  const { isSidebarOpen, setSidebarOpen } = useLayout();
  const { element: headerSlot } = useMainHeaderSlot();
  const currentUser = sessionStore((state) => state.currentUser);

  const [threads, setThreads] = useState<CommandThread[]>(
    INITIAL_COMMAND_THREADS,
  );
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    INITIAL_COMMAND_THREADS[0]?.id ?? null,
  );
  const [activeFilter, setActiveFilter] = useState<SessionFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mutual-exclusivity state matching MessagesPage
  const [userWantsDesktopHistory, setUserWantsDesktopHistory] = useState(true);
  const [mobileShowHistory, setMobileShowHistory] = useState(false);

  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<CommandMode>("orchestrate");
  const [selectedModel, setSelectedModel] = useState<AIModelOption>(
    AVAILABLE_MODELS[0],
  );
  const [selectedContexts, setSelectedContexts] = useState<ContextAttachment[]>(
    [],
  );

  const handleTogglePin = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, pinned: !t.pinned } : t)),
    );
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (selectedThreadId === threadId) {
      setSelectedThreadId(null);
    }
  };

  const timersRef = useRef<number[]>([]);

  const clearScheduledTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearScheduledTimers();
  }, [clearScheduledTimers]);

  const showDesktopHistory = !isSidebarOpen && userWantsDesktopHistory;
  const showMobileHistory = !isSidebarOpen && mobileShowHistory;

  const activeThread = useMemo(
    () => threads.find((t) => t.id === selectedThreadId) ?? null,
    [threads, selectedThreadId],
  );

  const quickPrompts = useMemo(
    () => getPromptsForRole(currentUser?.user.userType),
    [currentUser?.user.userType],
  );

  const userInitials = useMemo(() => {
    const first = currentUser?.user.firstName?.[0] ?? "";
    const last = currentUser?.user.lastName?.[0] ?? "";
    return (first + last).toUpperCase() || "ED";
  }, [currentUser?.user.firstName, currentUser?.user.lastName]);

  const handleToggleHistoryPanel = () => {
    if (isSidebarOpen) {
      // Mutual-exclusivity rule: opening conversation list minimizes main sidebar
      setSidebarOpen(false);
      setUserWantsDesktopHistory(true);
      setMobileShowHistory(true);
      return;
    }

    if (window.innerWidth < 768) {
      setMobileShowHistory((prev) => !prev);
    } else {
      setUserWantsDesktopHistory((prev) => !prev);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    setSidebarOpen(false);
    setMobileShowHistory(false);
  };

  const handleNewSession = () => {
    setSelectedThreadId(null);
    setSidebarOpen(false);
    setMobileShowHistory(false);
  };

  const handleToggleContext = (ctx: ContextAttachment) => {
    setSelectedContexts((prev) =>
      prev.some((c) => c.id === ctx.id)
        ? prev.filter((c) => c.id !== ctx.id)
        : [...prev, ctx],
    );
  };

  const runOrchestrationSimulation = useCallback(
    (
      threadId: string,
      messageId: string,
      title: string,
      steps: OrchestrationStep[],
      startIndex: number,
      voiceMuted = false,
    ) => {
      clearScheduledTimers();

      const total = steps.length;
      if (startIndex >= total) return;

      const scheduleStep = (idx: number, currentSteps: OrchestrationStep[]) => {
        const updatedSteps = currentSteps.map((s, i) => ({
          ...s,
          status:
            i < idx
              ? ("completed" as const)
              : i === idx
                ? ("running" as const)
                : ("pending" as const),
          durationLabel: i < idx ? (s.durationLabel ?? "1.1s") : s.durationLabel,
        }));

        setThreads((prev) =>
          prev.map((t) =>
            t.id !== threadId
              ? t
              : {
                  ...t,
                  isRunning: true,
                  isPaused: false,
                  statusLabel: `Running (${idx}/${total})`,
                  messages: t.messages.map((m) =>
                    m.id === messageId && m.orchestration
                      ? {
                          ...m,
                          orchestration: {
                            ...m.orchestration,
                            state: "running",
                            summary: `Executing step ${idx + 1} of ${total}`,
                            steps: updatedSteps,
                          },
                        }
                      : m,
                  ),
                },
          ),
        );

        const tId = window.setTimeout(() => {
          const nextSteps = updatedSteps.map((s, i) =>
            i === idx
              ? { ...s, status: "completed" as const, durationLabel: "1.1s" }
              : s,
          );

          if (idx + 1 < total) {
            scheduleStep(idx + 1, nextSteps);
          } else {
            const spokenDone = `Finished all ${total} steps for ${title}. Everything is staged and ready for your review.`;

            setThreads((prev) =>
              prev.map((t) =>
                t.id !== threadId
                  ? t
                  : {
                      ...t,
                      isRunning: false,
                      isPaused: false,
                      statusLabel: "Completed",
                      preview: spokenDone,
                      messages: t.messages.map((m) =>
                        m.id === messageId && m.orchestration
                          ? {
                              ...m,
                              spokenNote: spokenDone,
                              content:
                                "Orchestration complete. I've coordinated every step across the selected Eduvia modules and attached direct links below.",
                              orchestration: {
                                ...m.orchestration,
                                state: "completed",
                                summary: `${total} of ${total} actions completed`,
                                steps: nextSteps,
                                artifacts: m.orchestration.artifacts ?? [
                                  {
                                    id: `art-${Date.now()}-1`,
                                    label: "Updated Lesson Schedule",
                                    targetRoute: "/calendar",
                                    meta: "Calendar",
                                  },
                                  {
                                    id: `art-${Date.now()}-2`,
                                    label: "Staged Question Set (5)",
                                    targetRoute: "/questions",
                                    meta: "Question Bank",
                                  },
                                ],
                              },
                            }
                          : m,
                      ),
                    },
              ),
            );
          }
        }, 1050);

        timersRef.current.push(tId);
      };

      scheduleStep(startIndex, steps);
    },
    [clearScheduledTimers],
  );

  const submitCommand = useCallback(
    (
      promptText: string,
      commandMode: CommandMode,
      contexts: ContextAttachment[],
    ) => {
      const cleanPrompt = promptText.trim();
      if (!cleanPrompt) return;

      const time = nowTimeLabel();
      const userMsg: CommandMessage = {
        id: `msg-u-${Date.now()}`,
        role: "user",
        mode: commandMode,
        content: cleanPrompt,
        timestamp: time,
        contexts: contexts.length > 0 ? contexts : undefined,
      };

      const targetThreadId = selectedThreadId ?? `thread-${Date.now()}`;
      const derivedTitle =
        cleanPrompt.length > 42
          ? `${cleanPrompt.slice(0, 42).trim()}...`
          : cleanPrompt;

      if (commandMode === "orchestrate") {
        const steps = createStepsForPrompt(cleanPrompt, contexts);
        const assistantId = `msg-a-${Date.now()}`;
        const assistantMsg: CommandMessage = {
          id: assistantId,
          role: "assistant",
          mode: "orchestrate",
          timestamp: time,
          content: "Coordinating your request across Eduvia modules...",
          orchestration: {
            id: `orch-${Date.now()}`,
            goal: derivedTitle,
            summary: `Starting step 1 of ${steps.length}`,
            state: "running",
            steps,
          },
        };

        setThreads((prev) => {
          const exists = prev.some((t) => t.id === targetThreadId);
          if (exists) {
            return prev.map((t) =>
              t.id === targetThreadId
                ? {
                    ...t,
                    kind: "orchestrate",
                    updatedAt: "Just now",
                    isRunning: true,
                    isPaused: false,
                    statusLabel: `Running (0/${steps.length})`,
                    preview: cleanPrompt,
                    messages: [...t.messages, userMsg, assistantMsg],
                  }
                : t,
            );
          }

          const newThread: CommandThread = {
            id: targetThreadId,
            title: derivedTitle,
            subtitle:
              contexts.length > 0
                ? contexts.map((c) => c.label).join(", ")
                : "Multi-module orchestration",
            kind: "orchestrate",
            accent: "emerald",
            iconKind: "workflow",
            preview: cleanPrompt,
            updatedAt: "Just now",
            isRunning: true,
            statusLabel: `Running (0/${steps.length})`,
            contexts,
            messages: [userMsg, assistantMsg],
          };
          return [newThread, ...prev];
        });

        setSelectedThreadId(targetThreadId);
        setDraft("");
        runOrchestrationSimulation(
          targetThreadId,
          assistantId,
          derivedTitle,
          steps,
          0,
        );
        return;
      }

      const discussReply = `For "${derivedTitle}", start with a single worked example on the Learning Board in ${contexts[0]?.label ?? "your classroom"}, highlight the sign or variable transition before solving, and run a 2-minute check before independent practice.`;

      const assistantMsg: CommandMessage = {
        id: `msg-a-${Date.now()}`,
        role: "assistant",
        mode: "discuss",
        timestamp: time,
        spokenNote: discussReply,
        content: discussReply,
      };

      setThreads((prev) => {
        const exists = prev.some((t) => t.id === targetThreadId);
        if (exists) {
          return prev.map((t) =>
            t.id === targetThreadId
              ? {
                  ...t,
                  updatedAt: "Just now",
                  preview: discussReply,
                  messages: [...t.messages, userMsg, assistantMsg],
                }
              : t,
          );
        }

        const newThread: CommandThread = {
          id: targetThreadId,
          title: derivedTitle,
          subtitle:
            contexts[0]?.label ?? "Teaching strategy & classroom discussion",
          kind: "discuss",
          accent: "purple",
          iconKind: "calculator",
          preview: discussReply,
          updatedAt: "Just now",
          statusLabel: "Discussion",
          contexts,
          messages: [userMsg, assistantMsg],
        };
        return [newThread, ...prev];
      });

      setSelectedThreadId(targetThreadId);
      setDraft("");
      clearScheduledTimers();
    },
    [clearScheduledTimers, runOrchestrationSimulation, selectedThreadId],
  );

  const handleResumeOrchestration = (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    const targetMsg = [...thread.messages]
      .reverse()
      .find((m) => m.orchestration && m.orchestration.state === "paused");

    if (!targetMsg?.orchestration) return;

    const firstUnfinished = targetMsg.orchestration.steps.findIndex(
      (s) => s.status !== "completed",
    );
    const startIdx = firstUnfinished === -1 ? 0 : firstUnfinished;

    runOrchestrationSimulation(
      thread.id,
      targetMsg.id,
      thread.title,
      targetMsg.orchestration.steps,
      startIdx,
    );
  };

  const handleSpeakReply = (_threadId: string, spokenText: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTriggerVoiceSimulation = () => {
    clearScheduledTimers();
    submitCommand(
      "Prepare tomorrow's starter problems for SS2A and attach a 10-minute board recap.",
      "orchestrate",
      selectedContexts.length > 0
        ? selectedContexts
        : [
            {
              id: "ctx-ss2a",
              label: "SS2A Mathematics",
              category: "classroom",
            },
          ],
    );
  };

  const handleSelectQuickPrompt = (
    item: QuickCommandPrompt,
    runImmediately: boolean,
  ) => {
    setMode(item.mode);
    setSelectedContexts(item.contexts);
    if (runImmediately) {
      submitCommand(item.prompt, item.mode, item.contexts);
    } else {
      setDraft(item.prompt);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      {/* Global Header Portal matching MessagesHeader exactly (right-aligned) */}
      {headerSlot
        ? createPortal(
            <div className="flex h-full min-w-0 shrink-0 items-center justify-end gap-2 md:gap-3.5">
              {/* Global Search Input matching MessagesHeader */}
              <div className="relative hidden md:flex items-center w-56 lg:w-80">
                <Search
                  className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground/70"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sessions, classrooms or tasks..."
                  className="h-8.5 w-full rounded-lg border border-border/50 bg-muted/25 dark:bg-[#0d1612] pl-8.5 pr-11 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
                <div className="absolute right-2 flex items-center gap-0.5 rounded border border-border/40 bg-muted/30 px-1 py-0.5 text-[10px] font-medium text-muted-foreground/80">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              </div>

              {/* New Session Button */}
              <button
                type="button"
                onClick={handleNewSession}
                className="flex size-8 sm:size-auto sm:h-8.5 sm:px-3.5 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="size-3.5 stroke-[2.5]" aria-hidden="true" />
                <span className="hidden sm:inline">New session</span>
              </button>
            </div>,
            headerSlot,
          )
        : null}

      {/* Main Split Content Area matching MessagesPage */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Pane: Session History List */}
        <div
          className={cn(
            "shrink-0 flex-col border-r border-border/40 bg-background transition-all duration-200",
            showMobileHistory ? "flex w-full" : "hidden",
            showDesktopHistory ? "md:flex md:w-56 lg:w-60" : "md:hidden",
          )}
        >
          <CommandCenterHistory
            threads={threads}
            selectedThreadId={selectedThreadId}
            liveThreadId={null}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            onFilterChange={setActiveFilter}
            onSearchChange={setSearchQuery}
            onSelectThread={handleSelectThread}
            onNewSession={handleNewSession}
            onCollapsePanel={() => setUserWantsDesktopHistory(false)}
            onTogglePin={handleTogglePin}
            onDeleteThread={handleDeleteThread}
          />
        </div>

        {/* Right Pane: Active AI Workspace + Floating Live Capsule + Composer */}
        <div
          className={cn(
            "relative flex-1 min-w-0 flex-col bg-background",
            showMobileHistory ? "hidden md:flex" : "flex",
          )}
        >
          <CommandCenterThreadView
            thread={activeThread}
            firstName={currentUser?.user.firstName}
            userInitials={userInitials}
            quickPrompts={quickPrompts}
            hasFloatingHud={false}
            isHistoryOpen={showDesktopHistory}
            onToggleHistory={handleToggleHistoryPanel}
            onNewSession={handleNewSession}
            onTriggerVoice={handleTriggerVoiceSimulation}
            onSelectPrompt={handleSelectQuickPrompt}
            onResumeOrchestration={handleResumeOrchestration}
            onSpeakReply={handleSpeakReply}
          />

          <CommandCenterComposer
            draft={draft}
            mode={mode}
            selectedContexts={selectedContexts}
            isVoiceActive={false}
            selectedModel={selectedModel}
            onDraftChange={setDraft}
            onModeChange={setMode}
            onToggleContext={handleToggleContext}
            onSelectModel={setSelectedModel}
            onSend={() => submitCommand(draft, mode, selectedContexts)}
            onTriggerVoiceSimulation={handleTriggerVoiceSimulation}
          />
        </div>
      </div>
    </div>
  );
}
