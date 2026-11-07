import { createPortal } from "react-dom";
import { MessageSquare, Plus, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";

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
    <div className="flex w-full min-w-0 items-center justify-between gap-4">
      {/* 1. Left: Title with Chat Icon */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="size-4.5" />
        </div>
        <h1 className="font-heading text-lg font-bold tracking-tight text-foreground">
          Messages
        </h1>
      </div>

      {/* 2. Middle: Global Search Input with Shortcut Badge */}
      <div className="hidden sm:flex relative flex-1 max-w-md items-center">
        <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search messages, people or groups..."
          className="w-full rounded-xl border border-border/60 bg-muted/20 py-2 pl-9 pr-14 text-xs text-foreground placeholder:text-muted-foreground/70 transition-all focus:border-primary/60 focus:bg-background/80 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <div className="absolute right-2.5 flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* 3. Right: Unread Filter Toggle and New Chat Button */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleUnreadOnly}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            unreadOnly
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <span>Unread only</span>
          <div
            className={`size-3.5 rounded-sm border transition-colors flex items-center justify-center ${
              unreadOnly
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/80 bg-background/60"
            }`}
          >
            {unreadOnly && (
              <svg
                viewBox="0 0 14 14"
                className="size-2.5 fill-none stroke-current stroke-2"
              >
                <path d="M3 7l3 3 5-5" />
              </svg>
            )}
          </div>
        </button>

        <Button
          onClick={onOpenNewChat}
          className="h-8.5 rounded-xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all gap-1.5"
        >
          <Plus className="size-4" />
          <span>New chat</span>
        </Button>
      </div>
    </div>,
    headerSlot,
  );
}
