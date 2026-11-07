import { useEffect, useRef } from "react";
import {
  Calculator,
  GraduationCap,
  Leaf,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Star,
  Users,
  UsersRound,
} from "lucide-react";
import type { Conversation } from "../../domain/types";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatMessage } from "./chat-message";
import { MessageInput } from "./message-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

interface ChatRoomProps {
  conversation: Conversation | null;
  onSendMessage: (content: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onCreateNewMessage: () => void;
  onBrowseContacts: () => void;
}

export function ChatRoom({
  conversation,
  onSendMessage,
  onReact,
  onCreateNewMessage,
  onBrowseContacts,
}: ChatRoomProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  if (!conversation) {
    return (
      <ChatEmptyState
        onCreateNewMessage={onCreateNewMessage}
        onBrowseContacts={onBrowseContacts}
      />
    );
  }

  const renderHeaderIcon = () => {
    if (conversation.type === "direct" && conversation.avatar) {
      return (
        <Avatar className="size-9 rounded-xl border border-border/50">
          <AvatarImage
            src={conversation.avatar}
            alt={conversation.name}
            className="object-cover"
          />
          <AvatarFallback className="rounded-xl text-xs font-semibold bg-muted">
            {conversation.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }

    const colorClasses = {
      emerald: "bg-primary/20 text-primary border-primary/30",
      purple: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      blue: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      leaf: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
    }[conversation.iconColor ?? "emerald"];

    const IconComponent = {
      users: UsersRound,
      graduation: GraduationCap,
      calculator: Calculator,
      shield: ShieldCheck,
      leaf: Leaf,
    }[conversation.iconType ?? "users"];

    return (
      <div
        className={`flex size-9 items-center justify-center rounded-xl border ${colorClasses}`}
      >
        <IconComponent className="size-4.5" />
      </div>
    );
  };

  return (
    <div className="flex h-full flex-1 flex-col rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* 1. Chat Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-background/30">
        <div className="flex items-center gap-3 min-w-0">
          {renderHeaderIcon()}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-sm font-bold text-foreground">
              {conversation.name}
            </h3>
            {conversation.subtitle && (
              <p className="truncate text-[11px] text-muted-foreground">
                {conversation.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
          <button
            type="button"
            title="Search in conversation"
            className="flex size-8 items-center justify-center rounded-lg hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            title="Star conversation"
            className="flex size-8 items-center justify-center rounded-lg hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            <Star className="size-4" />
          </button>
          <button
            type="button"
            title="Conversation members"
            className="flex size-8 items-center justify-center rounded-lg hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            <Users className="size-4" />
          </button>
          <button
            type="button"
            title="More options"
            className="flex size-8 items-center justify-center rounded-lg hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Date separator pill */}
        <div className="flex justify-center">
          <span className="rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground/80 shadow-2xs">
            Today, Jan 27
          </span>
        </div>

        {/* Message bubbles */}
        {conversation.messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onReact={onReact}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Message Input */}
      <MessageInput
        conversationName={conversation.name}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
