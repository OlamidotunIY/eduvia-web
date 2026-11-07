import { CheckCheck, MoreHorizontal, Search } from "lucide-react";
import type { Conversation, ConversationFilter } from "../../domain/types";
import { ConversationItem } from "./conversation-item";
import { ConversationListEmpty } from "./conversation-list-empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeFilter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMarkAllAsRead: () => void;
  onStartNewChat: () => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onMarkAllAsRead,
  onStartNewChat,
}: ConversationListProps) {
  const filterTabs: { id: ConversationFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "direct", label: "Direct" },
    { id: "groups", label: "Groups" },
  ];

  return (
    <div className="flex h-full w-full lg:w-96 shrink-0 flex-col rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden p-3.5 space-y-3">
      {/* 1. Header with Title and More Options */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
          Messages
        </h2>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg border border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onMarkAllAsRead} className="gap-2 text-xs">
              <CheckCheck className="size-4" />
              <span>Mark all as read</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-1.5 px-0.5">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Search Conversations Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search conversations..."
          className="w-full rounded-xl border border-border/50 bg-muted/20 py-1.5 pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/70 transition-all focus:border-primary/60 focus:bg-background/80 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>

      {/* 4. Scrollable Conversations List */}
      <div className="flex flex-1 flex-col overflow-y-auto pr-1 space-y-1">
        {conversations.length === 0 ? (
          <ConversationListEmpty onStartNewChat={onStartNewChat} />
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedId}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
