import { createPortal } from "react-dom";
import { MessageSquare, Plus, Search } from "lucide-react";

interface MessagesHeaderProps {
  headerSlot: HTMLDivElement | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  unreadOnly: boolean;
  onToggleUnreadOnly: () => void;
  onOpenNewChat: () => void;
}

export function MessagesHeader({
  headerSlot,
  searchQuery,
  onSearchChange,
  unreadOnly,
  onToggleUnreadOnly,
  onOpenNewChat,
}: MessagesHeaderProps) {
  if (!headerSlot) return null;

  return createPortal(
    <div className="flex w-full h-full min-w-0 items-center justify-between gap-2 md:gap-4">
      {/* 1. Left: Message Icon and Title */}
      <div className="flex items-center gap-2.5 shrink-0">
        <MessageSquare className="size-4.5 text-foreground/80" />
        <h1 className="font-heading text-base font-semibold tracking-tight text-foreground hidden sm:block">
          Messages
        </h1>
      </div>

      {/* 2. Right: Grouped Search + Unread Toggle + New Chat Button */}
      <div className="flex items-center gap-2 md:gap-3.5 shrink-0">
        {/* Global Search Input (visible on tablet/desktop) */}
        <div className="relative hidden md:flex items-center w-56 lg:w-80">
          <Search className="absolute left-3 size-3.5 text-muted-foreground/70 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages, people or groups..."
            className="w-full h-8.5 rounded-lg border border-border/50 bg-[#0d1612] pl-8.5 pr-11 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
          <div className="absolute right-2 flex items-center gap-0.5 rounded border border-border/40 bg-muted/30 px-1 py-0.5 text-[10px] font-medium text-muted-foreground/80">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Unread Only Toggle */}
        <button
          type="button"
          onClick={onToggleUnreadOnly}
          className="flex items-center gap-1.5 md:gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
        >
          <span className="hidden sm:inline">Unread only</span>
          <div
            className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-border/60 transition-colors duration-200 ease-in-out ${
              unreadOnly ? "bg-emerald-600 border-emerald-500" : "bg-muted/40"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                unreadOnly ? "translate-x-3.5 bg-white" : "translate-x-0 bg-muted-foreground/70"
              }`}
            />
          </div>
        </button>

        {/* New Chat Button */}
        <button
          type="button"
          onClick={onOpenNewChat}
          className="size-8 sm:size-auto sm:h-8.5 sm:px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">New chat</span>
        </button>
      </div>
    </div>,
    headerSlot,
  );
}
