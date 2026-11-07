import { MessageSquare, Plus, Users } from "lucide-react";
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
    <div className="flex h-full flex-1 flex-col rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* 1. Mini Top Breadcrumb/Header */}
      <div className="flex items-center gap-2 border-b border-border/50 px-5 py-3.5 bg-background/30">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
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
            className="h-9 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>Create new message</span>
          </Button>

          <Button
            variant="outline"
            onClick={onBrowseContacts}
            className="h-9 rounded-xl border-border/70 bg-muted/20 px-4 text-xs font-semibold text-foreground hover:bg-muted/40 transition-all gap-1.5"
          >
            <Users className="size-3.5" />
            <span>Browse contacts</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
