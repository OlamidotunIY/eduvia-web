import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  ArrowUp,
  AtSign,
  Check,
  ChevronDown,
  Mic,
  Plus,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { cn } from "cn";
import {
  AVAILABLE_CONTEXTS,
  AVAILABLE_MODELS,
} from "../../model/command-center.mock";
import type {
  AIModelOption,
  CommandMode,
  ContextAttachment,
} from "../../model/command-center.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface CommandCenterComposerProps {
  draft: string;
  mode: CommandMode;
  selectedContexts: ContextAttachment[];
  isVoiceActive: boolean;
  selectedModel?: AIModelOption;
  onDraftChange: (value: string) => void;
  onModeChange: (mode: CommandMode) => void;
  onToggleContext: (ctx: ContextAttachment) => void;
  onSelectModel?: (model: AIModelOption) => void;
  onSend: () => void;
  onTriggerVoiceSimulation: () => void;
}

export function CommandCenterComposer({
  draft,
  mode,
  selectedContexts,
  isVoiceActive,
  selectedModel = AVAILABLE_MODELS[0],
  onDraftChange,
  onModeChange,
  onToggleContext,
  onSelectModel,
  onSend,
  onTriggerVoiceSimulation,
}: CommandCenterComposerProps) {
  const [showContextPicker, setShowContextPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140,
      )}px`;
    }
  }, [draft]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (draft.trim()) {
        onSend();
      }
    }
  };

  const hasDraft = draft.trim().length > 0;

  return (
    <div className="w-full shrink-0 px-4 sm:px-6 md:px-8 pb-3 pt-1">
      <div className="mx-auto max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        {/* Floating Composer Island (Codex / ChatGPT style) */}
        <div className="relative rounded-2xl border border-border/70 bg-card/75 dark:bg-[#18181b]/95 shadow-md backdrop-blur-md transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 overflow-hidden">
          {/* Optional Context Picker Popover Banner */}
          {showContextPicker && (
            <div
              role="region"
              aria-label="Scope AI to Eduvia context"
              className="border-b border-border/40 bg-muted/30 p-2.5 flex flex-wrap items-center gap-1.5 animate-in fade-in-50 duration-150"
            >
              <span className="mr-1 text-xs font-semibold text-muted-foreground">
                Attach Context:
              </span>
              {AVAILABLE_CONTEXTS.map((ctx) => {
                const selected = selectedContexts.some((c) => c.id === ctx.id);
                return (
                  <button
                    key={ctx.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggleContext(ctx)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer",
                      selected
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border/50 bg-background/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {selected && <Check className="size-3" />}
                    <span>{ctx.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowContextPicker(false)}
                aria-label="Close context picker"
                className="ml-auto flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {/* Selected Context Chips */}
          {selectedContexts.length > 0 && !showContextPicker && (
            <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3">
              {selectedContexts.map((ctx) => (
                <span
                  key={ctx.id}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  <AtSign className="size-2.5" />
                  <span>{ctx.label}</span>
                  <button
                    type="button"
                    onClick={() => onToggleContext(ctx)}
                    className="hover:text-foreground ml-0.5 cursor-pointer"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Textarea Input */}
          <div className="px-4 pt-3 pb-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Prompt or instruction for Eduvia AI"
              placeholder={
                mode === "orchestrate"
                  ? "Instruct Eduvia AI to orchestrate lesson pacing, board exercises, or reports..."
                  : "Work with Eduvia AI..."
              }
              className="w-full resize-none bg-transparent text-sm sm:text-[14.5px] text-foreground placeholder:text-muted-foreground/60 placeholder:text-sm focus:outline-none min-h-[38px] max-h-[160px] leading-relaxed scrollbar-none"
            />
          </div>

          {/* Bottom Toolbar Row matching Codex UI in screenshot */}
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1">
            {/* Left Tools */}
            <div className="flex items-center gap-1.5">
              {/* Attach Context Button (+) */}
              <button
                type="button"
                onClick={() => setShowContextPicker((prev) => !prev)}
                title="Attach classroom or curriculum scope"
                className={cn(
                  "flex size-7.5 sm:size-8 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer",
                  (showContextPicker || selectedContexts.length > 0) &&
                    "border-primary/40 text-primary bg-primary/10",
                )}
              >
                <Plus className="size-4" />
              </button>

              {/* Mode / Access Badge Pill (e.g. "Full access" or "Discuss mode") */}
              <button
                type="button"
                onClick={() =>
                  onModeChange(mode === "orchestrate" ? "discuss" : "orchestrate")
                }
                title="Toggle AI capability mode"
                className={cn(
                  "inline-flex h-7.5 sm:h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer",
                  mode === "orchestrate"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-500 dark:border-amber-500/30 dark:bg-amber-500/15"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground",
                )}
              >
                {mode === "orchestrate" ? (
                  <>
                    <Zap className="size-3 fill-amber-500/30" />
                    <span>Full access</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3" />
                    <span>Discuss</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Tools: Model Selector + Mic + Submit Button */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Model Dropdown Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="flex items-center gap-1.5 h-7.5 sm:h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                    />
                  }
                >
                  <span className="text-xs font-medium">
                    {selectedModel?.name ?? "5.6 Terra Medium"}
                  </span>
                  <ChevronDown className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 text-xs sm:text-sm">
                  <div className="px-2.5 py-1.5 text-xs uppercase font-semibold text-muted-foreground">
                    Model Selection
                  </div>
                  {AVAILABLE_MODELS.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => onSelectModel?.(model)}
                      className="flex items-center justify-between text-xs sm:text-sm py-2"
                    >
                      <div>
                        <p className="font-medium text-foreground">{model.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {model.tier}
                        </p>
                      </div>
                      {selectedModel?.id === model.id && (
                        <Check className="size-3.5 text-primary shrink-0 ml-2" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={onTriggerVoiceSimulation}
                aria-pressed={isVoiceActive}
                title="Voice conversation mode"
                className={cn(
                  "flex size-7.5 sm:size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer",
                  isVoiceActive && "text-emerald-500 bg-emerald-500/10",
                )}
              >
                <Mic className="size-4" />
              </button>

              {/* Circular Submit Button with Arrow Up (↑) */}
              <button
                type="button"
                onClick={onSend}
                disabled={!hasDraft}
                aria-label="Send message"
                className={cn(
                  "flex size-8 sm:size-8.5 shrink-0 items-center justify-center rounded-full transition-all shadow-2xs",
                  hasDraft
                    ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95"
                    : "bg-muted text-muted-foreground/40 cursor-not-allowed opacity-60",
                )}
              >
                <ArrowUp className="size-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Discreet Disclaimer below Composer */}
        <p className="mt-2 text-center text-xs text-muted-foreground/60">
          Eduvia AI can assist with curriculum planning, assessments, and reports. Verify important details.
        </p>
      </div>
    </div>
  );
}
