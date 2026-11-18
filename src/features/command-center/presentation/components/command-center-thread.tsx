import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleDot,
  Clock,
  Code,
  Copy,
  FileText,
  MessageSquare,
  MoreHorizontal,
  PanelLeft,
  PauseCircle,
  Play,
  Share2,
  Sparkles,
  Volume2,
  Workflow,
  Zap,
} from "lucide-react";
import { cn } from "cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type {
  CommandMessage,
  CommandThread,
  OrchestrationPlan,
  QuickCommandPrompt,
} from "../../model/command-center.types";

interface CommandCenterThreadProps {
  thread: CommandThread | null;
  firstName?: string;
  userInitials: string;
  quickPrompts: QuickCommandPrompt[];
  hasFloatingHud?: boolean;
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  onNewSession: () => void;
  onTriggerVoice: () => void;
  onSelectPrompt: (prompt: QuickCommandPrompt, runImmediately: boolean) => void;
  onResumeOrchestration: (threadId: string) => void;
  onSpeakReply: (threadId: string, spokenText: string) => void;
}

// Code / Plain Text Artifact Block matching ChatGPT / Codex in screenshot
function CodeArtifactBlock({
  content,
  language = "Plain text",
}: {
  content: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-lg border border-zinc-800 bg-[#161618] dark:bg-[#121214] text-zinc-100 overflow-hidden shadow-2xs">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800/80 bg-zinc-900/60 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Code className="size-3 text-zinc-400" />
          <span className="font-mono text-[10px]">{language}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="size-2.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-2.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code / Content Area */}
      <pre className="p-3 font-mono text-[11px] leading-relaxed overflow-x-auto text-zinc-200 whitespace-pre scrollbar-thin">
        <code>{content}</code>
      </pre>
    </div>
  );
}

// Orchestration Pipeline Card
function OrchestrationPipeline({
  plan,
  threadId,
  onResumeOrchestration,
}: {
  plan: OrchestrationPlan;
  threadId: string;
  onResumeOrchestration: (threadId: string) => void;
  onSpeakReply: (threadId: string, text: string) => void;
}) {
  const completedCount = plan.steps.filter((s) => s.status === "completed").length;

  return (
    <div className="mt-2.5 max-w-xl space-y-2">
      <div className="rounded-lg border border-border/60 bg-muted/20 dark:bg-[#141816] p-3">
        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-border/40">
          <div className="flex items-center gap-1.5 min-w-0">
            <Workflow className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
            <span className="truncate text-[11px] font-semibold text-foreground">
              {plan.goal}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
              {completedCount}/{plan.steps.length} steps
            </span>

            {plan.state === "paused" && (
              <button
                type="button"
                onClick={() => onResumeOrchestration(threadId)}
                className="inline-flex h-5.5 items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-500 px-2 text-[10px] font-semibold text-white transition-transform active:scale-[0.97] cursor-pointer"
              >
                <Play className="size-2 fill-current" />
                <span>Resume</span>
              </button>
            )}
          </div>
        </div>

        {/* Connected Vertical Step Spine */}
        <ol className="relative mt-2.5 ml-1.5 border-l border-border/60 pl-4 space-y-2.5">
          {plan.steps.map((step) => (
            <li key={step.id} className="relative">
              <span
                className="absolute -left-[22px] top-0.5 flex size-3.5 items-center justify-center rounded-full bg-background dark:bg-[#141816]"
                aria-hidden="true"
              >
                {step.status === "completed" ? (
                  <CheckCircle2 className="size-3 text-emerald-500" />
                ) : step.status === "running" ? (
                  <CircleDot className="size-3 text-emerald-400 motion-safe:animate-pulse" />
                ) : step.status === "paused" ? (
                  <PauseCircle className="size-3 text-amber-400" />
                ) : (
                  <Clock className="size-3 text-muted-foreground/60" />
                )}
              </span>

              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    step.status === "pending"
                      ? "text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  {step.title}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {step.durationLabel && (
                    <span className="text-[9px] tabular-nums text-muted-foreground/70">
                      {step.durationLabel}
                    </span>
                  )}
                  <span className="rounded border border-border/50 bg-background/60 px-1 py-0.2 text-[9px] font-medium text-muted-foreground">
                    {step.module}
                  </span>
                </div>
              </div>

              <p className="mt-0.5 text-[11px] text-muted-foreground/85 leading-relaxed">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Deliverable Links */}
      {plan.artifacts && plan.artifacts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {plan.artifacts.map((artifact) => (
            <Link
              key={artifact.id}
              to={artifact.targetRoute}
              className="flex min-w-48 max-w-xs items-center justify-between gap-2.5 rounded-lg border border-border/50 bg-muted/20 hover:border-emerald-500/40 p-2 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background text-emerald-500">
                  <FileText className="size-3" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-foreground">
                    {artifact.label}
                  </p>
                  <p className="truncate text-[9px] text-muted-foreground">
                    {artifact.meta}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="size-3 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Formatted Message Turn
function MessageTurn({
  message,
  threadId,
  onResumeOrchestration,
  onSpeakReply,
}: {
  message: CommandMessage;
  threadId: string;
  onResumeOrchestration: (threadId: string) => void;
  onSpeakReply: (threadId: string, text: string) => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  // If user message, render the clean right-aligned blue pill like in ChatGPT / Codex
  if (isUser) {
    return (
      <div className="flex justify-end animate-in fade-in-50 duration-200">
        <div className="rounded-xl bg-blue-600 dark:bg-blue-600 text-white px-3 py-1.5 text-xs shadow-2xs max-w-[75%] leading-relaxed font-normal">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant Turn: Parse markdown blocks for code snippets / plain text diagrams
  const parseBlocks = (raw: string) => {
    const parts = raw.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim();
        const firstLineEnd = lines.indexOf("\n");
        let lang = "Plain text";
        let body = lines;
        if (firstLineEnd !== -1) {
          const firstWord = lines.slice(0, firstLineEnd).trim();
          if (firstWord && !firstWord.includes(" ")) {
            lang = firstWord;
            body = lines.slice(firstLineEnd + 1);
          }
        }
        return <CodeArtifactBlock key={index} content={body} language={lang} />;
      }
      return (
        <p
          key={index}
          className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed font-normal my-1.5"
        >
          {part}
        </p>
      );
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-start gap-2.5 animate-in fade-in-50 duration-200">
      <div className="flex size-5.5 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
        <Sparkles className="size-3" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Render prose and any embedded code/artifact diagrams */}
        <div>{parseBlocks(message.content)}</div>

        {/* Render Orchestration Pipeline if present */}
        {message.orchestration && (
          <OrchestrationPipeline
            plan={message.orchestration}
            threadId={threadId}
            onResumeOrchestration={onResumeOrchestration}
            onSpeakReply={onSpeakReply}
          />
        )}

        {/* Hover Action Strip */}
        <div className="flex items-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground py-0.5 px-1.5 rounded hover:bg-muted/40 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-2.5 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-2.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onSpeakReply(
                threadId,
                message.spokenNote ?? message.content.slice(0, 150),
              )
            }
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground py-0.5 px-1.5 rounded hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <Volume2 className="size-2.5" />
            <span>Read aloud</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommandCenterThreadView({
  thread,
  quickPrompts,
  isHistoryOpen,
  onToggleHistory,
  onNewSession,
  onSelectPrompt,
  onResumeOrchestration,
  onSpeakReply,
}: CommandCenterThreadProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messageCount = thread?.messages.length ?? 0;

  // Auto-scroll on new message
  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.id, messageCount]);

  // Monitor scroll position to show/hide circular down arrow button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 120);
  };

  const scrollToBottom = () => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden bg-background">
      {/* 1. Header Bar: Compact, clean, no folder icon */}
      <div className="flex h-10 items-center justify-between px-3.5 border-b border-border/40 bg-background/80 backdrop-blur-xs shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          {!isHistoryOpen && (
            <button
              type="button"
              onClick={onToggleHistory}
              aria-label="Open sidebar"
              className="flex size-6.5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <PanelLeft className="size-3.5" />
            </button>
          )}

          {thread ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <MessageSquare className="size-3 text-muted-foreground/60 shrink-0" />
              <span className="truncate text-xs font-semibold text-foreground">
                {thread.title}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                New conversation
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {thread?.kind === "orchestrate" && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-500">
              <Zap className="size-2 fill-amber-500/30" />
              <span>Full access</span>
            </span>
          )}

          <button
            type="button"
            className="flex size-6.5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            title="Share session"
          >
            <Share2 className="size-3" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex size-6.5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                />
              }
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 text-xs">
              <DropdownMenuItem onClick={onNewSession} className="gap-2 text-[11px]">
                <Sparkles className="size-3" />
                <span>New Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Messages Timeline Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 scrollbar-thin"
      >
        <div className="mx-auto max-w-2xl lg:max-w-3xl space-y-4">
          {!thread || thread.messages.length === 0 ? (
            /* Empty State / Hero prompt launcher */
            <div className="py-8 sm:py-14 flex flex-col items-center justify-center text-center animate-in fade-in-50 duration-200">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs mb-3">
                <Sparkles className="size-5" />
              </div>
              <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                How can Eduvia assist your teaching today?
              </h2>
              <p className="mt-1 text-xs text-muted-foreground max-w-md">
                Orchestrate lesson board decks, balance assessment questions, or draft comprehensive parent progress digests.
              </p>

              {/* Prompt Suggestions Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp.id}
                    type="button"
                    onClick={() => onSelectPrompt(qp, false)}
                    className="flex flex-col items-start p-3 rounded-lg border border-border/60 hover:border-border hover:bg-muted/40 transition-colors group cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {qp.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                      {qp.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Render Thread Messages */
            thread.messages.map((message) => (
              <MessageTurn
                key={message.id}
                message={message}
                threadId={thread.id}
                onResumeOrchestration={onResumeOrchestration}
                onSpeakReply={onSpeakReply}
              />
            ))
          )}

          <div ref={bottomAnchorRef} />
        </div>
      </div>

      {/* 3. Floating Scroll To Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Scroll to latest message"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex size-7 items-center justify-center rounded-full border border-border/80 bg-background/95 hover:bg-muted text-muted-foreground hover:text-foreground shadow-md transition-all cursor-pointer backdrop-blur-xs z-10 animate-in fade-in-50 zoom-in-95"
        >
          <ArrowDown className="size-3" />
        </button>
      )}
    </div>
  );
}
