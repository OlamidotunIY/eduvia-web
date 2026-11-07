import { CheckCheck, MoreHorizontal, Search } from "lucide-react";
import type { Conversation, ConversationFilter } from "@/shared/domain";
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
    <div className="flex h-full w-80 md:w-88 lg:w-96 shrink-0 flex-col border-r border-border/40 bg-background/60 overflow-hidden">
      {/* 1. Header with Title and More Options */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
        <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
          Messages
        </h2>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md border border-border/40 text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors cursor-pointer"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onMarkAllAsRead} className="gap-2 text-xs">
              <CheckCheck className="size-3.5" />
              <span>Mark all as read</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 px-4 pb-3">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Search Conversations Input */}
      <div className="px-4 pb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 size-3.5 text-muted-foreground/70 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-8.5 rounded-lg border border-border/40 bg-[#0d1612] pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* 4. Scrollable Conversations List */}
      <div className="flex flex-1 flex-col overflow-y-auto px-2 pb-2 space-y-1">
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
