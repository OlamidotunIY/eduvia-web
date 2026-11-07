import { useEffect, useRef } from "react";
import {
  Calculator,
  GraduationCap,
  Leaf,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";
import type { Conversation } from "@/shared/domain";
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
        <Avatar className="size-9 rounded-full border border-border/40">
          <AvatarImage
            src={conversation.avatar}
            alt={conversation.name}
            className="object-cover"
          />
          <AvatarFallback className="rounded-full text-xs font-semibold bg-muted">
            {conversation.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }

    const colorClasses = {
      emerald: "bg-[#0f3424] text-[#00c978] border-[#1c553a]",
      purple: "bg-[#1e1933] text-[#a78bfa] border-[#372a5a]",
      blue: "bg-[#112438] text-[#38bdf8] border-[#1c4164]",
      amber: "bg-[#2d1f14] text-[#fb923c] border-[#52331d]",
      leaf: "bg-[#0f3424] text-[#4ade80] border-[#1c553a]",
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
    <div className="flex h-full flex-1 min-w-0 flex-col bg-background overflow-hidden">
      {/* 1. Chat Header */}
      <div className="flex h-14 items-center justify-between border-b border-border/40 px-5 shrink-0 bg-background/50">
        <div className="flex items-center gap-3 min-w-0">
          {renderHeaderIcon()}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-sm font-bold text-foreground">
              {conversation.name}
            </h3>
            {conversation.subtitle && (
              <p className="truncate text-xs text-muted-foreground">
                {conversation.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
          <button
            type="button"
            title="Search in conversation"
            className="flex size-8 items-center justify-center rounded-lg border border-border/40 hover:bg-muted/30 hover:text-foreground transition-colors cursor-pointer"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            title="Star conversation"
            className="flex size-8 items-center justify-center rounded-lg border border-border/40 hover:bg-muted/30 hover:text-foreground transition-colors cursor-pointer"
          >
            <Star className="size-4" />
          </button>
          <button
            type="button"
            title="Conversation members"
            className="flex size-8 items-center justify-center rounded-lg border border-border/40 hover:bg-muted/30 hover:text-foreground transition-colors cursor-pointer"
          >
            <UsersRound className="size-4" />
          </button>
          <button
            type="button"
            title="More options"
            className="flex size-8 items-center justify-center rounded-lg border border-border/40 hover:bg-muted/30 hover:text-foreground transition-colors cursor-pointer"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Date separator pill */}
        <div className="flex justify-center my-1">
          <span className="rounded-full border border-border/40 bg-[#0d1612] px-3.5 py-1 text-[11px] font-medium text-muted-foreground/80 shadow-2xs">
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
