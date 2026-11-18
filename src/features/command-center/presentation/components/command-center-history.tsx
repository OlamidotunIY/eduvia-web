import { useState, useMemo } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  Pin,
  PinOff,
  Search,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { CommandThread } from "../../model/command-center.types";

export type SessionFilterTab = "all" | "orchestrate" | "discuss" | "pinned";

interface CommandCenterHistoryProps {
  threads: CommandThread[];
  selectedThreadId: string | null;
  liveThreadId?: string | null;
  activeFilter?: SessionFilterTab;
  searchQuery: string;
  onFilterChange?: (filter: SessionFilterTab) => void;
  onSearchChange: (query: string) => void;
  onSelectThread: (threadId: string) => void;
  onNewSession: () => void;
  onCollapsePanel: () => void;
  onTogglePin?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
}

export function CommandCenterHistory({
  threads,
  selectedThreadId,
  liveThreadId,
  searchQuery,
  onSearchChange,
  onSelectThread,
  onNewSession,
  onCollapsePanel,
  onTogglePin,
  onDeleteThread,
}: CommandCenterHistoryProps) {
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  // Filter threads by search query
  const searchedThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q),
    );
  }, [threads, searchQuery]);

  // Pinned threads vs regular threads (flat list, no project folders)
  const pinnedThreads = useMemo(() => {
    return searchedThreads.filter((t) => t.pinned);
  }, [searchedThreads]);

  const regularThreads = useMemo(() => {
    return searchedThreads.filter((t) => !t.pinned);
  }, [searchedThreads]);

  const renderThreadItem = (thread: CommandThread) => {
    const isActive = selectedThreadId === thread.id;
    const isLive = liveThreadId === thread.id;

    return (
      <div
        key={thread.id}
        className={cn(
          "group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs sm:text-[13.5px] transition-colors cursor-pointer",
          isActive
            ? "bg-muted text-foreground font-semibold shadow-2xs"
            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground font-medium",
        )}
        onClick={() => onSelectThread(thread.id)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isLive ? (
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          ) : (
            <MessageSquare className="size-3.5 text-muted-foreground/60 shrink-0 group-hover:text-foreground" />
          )}
          <span className="truncate leading-normal">{thread.title}</span>
        </div>

        {/* 3-dots hover action */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-opacity"
              />
            }
          >
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 text-xs sm:text-sm">
            {onTogglePin && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(thread.id);
                }}
                className="gap-2 text-xs sm:text-sm"
              >
                {thread.pinned ? (
                  <>
                    <PinOff className="size-3.5" />
                    <span>Unpin</span>
                  </>
                ) : (
                  <>
                    <Pin className="size-3.5" />
                    <span>Pin</span>
                  </>
                )}
              </DropdownMenuItem>
            )}
            {onDeleteThread && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(thread.id);
                  }}
                  className="gap-2 text-destructive text-xs sm:text-sm"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <aside
      aria-label="AI Conversations"
      className="flex h-full w-full flex-col overflow-hidden bg-background select-none text-xs sm:text-sm"
    >
      {/* 1. Clean Top Header: No Codex Logo, Compact Action Icons */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
          Chats
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            aria-label="Search sessions"
            title="Search sessions"
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
          >
            <Search className="size-3.5" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
          >
            <Bell className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={onCollapsePanel}
            aria-label="Close sidebar"
            title="Close sidebar"
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
          >
            <PanelLeftClose className="size-3.5" />
          </button>
        </div>
      </div>

      {/* 2. New Chat Button: Compact ChatGPT Style */}
      <div className="px-3 pt-0.5 pb-2.5 shrink-0">
        <button
          type="button"
          onClick={onNewSession}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl border border-border/50 bg-background hover:bg-muted/40 text-xs sm:text-sm font-medium text-foreground shadow-2xs transition-colors cursor-pointer"
        >
          <SquarePen className="size-4 text-muted-foreground" />
          <span>New chat</span>
        </button>
      </div>

      {/* Optional Search Bar */}
      {showSearch && (
        <div className="px-3 pb-2.5 shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-lg border border-border/60 bg-muted/20 pl-8 pr-7 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Scrollable Flat List: Pinned (Collapsible) + All Chats (Flat) */}
      <div className="flex-1 overflow-y-auto px-2 space-y-3.5 scrollbar-thin">
        {/* Pinned Section */}
        {pinnedThreads.length > 0 && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setIsPinnedExpanded((prev) => !prev)}
              className="flex items-center gap-1.5 w-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground transition-colors group cursor-pointer"
            >
              {isPinnedExpanded ? (
                <ChevronDown className="size-3 text-muted-foreground/60 group-hover:text-foreground" />
              ) : (
                <ChevronRight className="size-3 text-muted-foreground/60 group-hover:text-foreground" />
              )}
              <span>Pinned</span>
              <span className="ml-auto text-xs text-muted-foreground/50">
                {pinnedThreads.length}
              </span>
            </button>

            {isPinnedExpanded && (
              <div className="space-y-0.5">
                {pinnedThreads.map(renderThreadItem)}
              </div>
            )}
          </div>
        )}

        {/* Flat List of Regular / Recent Chats */}
        <div className="space-y-1">
          {pinnedThreads.length > 0 && regularThreads.length > 0 && (
            <div className="px-2.5 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Recent
            </div>
          )}

          {regularThreads.length > 0 ? (
            regularThreads.map(renderThreadItem)
          ) : pinnedThreads.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground/60">
              No conversations yet
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
