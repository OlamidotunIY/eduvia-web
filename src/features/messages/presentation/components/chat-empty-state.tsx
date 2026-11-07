import { MessageSquare, Plus, UsersRound } from "lucide-react";
import noConversationIllustration from "@/assets/eduvia_no_conversation_selected_transparent.png";
import { Button } from "@/shared/ui/button";

interface ChatEmptyStateProps {
  onCreateNewMessage: () => void;
  onBrowseContacts: () => void;
}

export function ChatEmptyState({
  onCreateNewMessage,
  onBrowseContacts,
}: ChatEmptyStateProps) {
  return (
    <div className="flex h-full flex-1 min-w-0 flex-col bg-background overflow-hidden">
      {/* 1. Mini Top Breadcrumb/Header */}
      <div className="flex h-14 items-center gap-2 border-b border-border/40 px-5 shrink-0 bg-background/50">
        <div className="flex size-7 items-center justify-center rounded-lg border border-border/40 bg-muted/20 text-muted-foreground">
          <MessageSquare className="size-3.5" />
        </div>
        <span className="font-heading text-xs font-bold text-foreground">
          Messages
        </span>
        <span className="text-xs text-muted-foreground/60">•</span>
        <span className="text-xs text-muted-foreground">
          Select a conversation or start a new one
        </span>
      </div>

      {/* 2. Main Empty State Body */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <img
          src={noConversationIllustration}
          alt="No conversation selected"
          className="mb-6 h-56 w-56 md:h-64 md:w-64 object-contain drop-shadow-md select-none"
        />
        <h3 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
          No conversation selected
        </h3>
        <p className="mt-2 max-w-md text-xs md:text-sm text-muted-foreground leading-relaxed">
          Choose a conversation from the list or start a new one to begin messaging.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={onCreateNewMessage}
            className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 text-xs font-semibold shadow-xs transition-all gap-1.5 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Create new message</span>
          </Button>

          <Button
            variant="outline"
            onClick={onBrowseContacts}
            className="h-9 rounded-lg border-border/60 bg-muted/20 px-4 text-xs font-semibold text-foreground hover:bg-muted/40 transition-all gap-1.5 cursor-pointer"
          >
            <UsersRound className="size-3.5" />
            <span>Browse contacts</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
