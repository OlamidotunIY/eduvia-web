import { Download, FileText, Smile } from "lucide-react";
import type { Message } from "@/shared/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

interface ChatMessageProps {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
}

export function ChatMessage({ message, onReact }: ChatMessageProps) {
  return (
    <div className="space-y-3">
      {/* 1. Optional Unread Messages Divider */}
      {message.isUnreadDividerBefore && (
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-emerald-500/40" />
          </div>
          <span className="relative z-10 rounded-full border border-emerald-500/40 bg-[#0c2419] px-3.5 py-0.5 text-xs font-semibold text-emerald-400 shadow-xs">
            3 new messages
          </span>
        </div>
      )}

      {/* 2. Message Bubble Item */}
      <div className="group flex items-start gap-3.5">
        <Avatar className="size-8.5 shrink-0 rounded-full border border-border/40">
          <AvatarImage
            src={message.senderAvatar}
            alt={message.senderName}
            className="object-cover"
          />
          <AvatarFallback className="rounded-full bg-muted text-xs font-semibold">
            {message.senderName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header row: Sender name & Timestamp */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs md:text-sm font-bold text-foreground">
              {message.senderName}
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              {message.createdAt}
            </span>
          </div>

          {/* Message content text */}
          <p className="mt-1 text-xs md:text-sm text-foreground/90 leading-relaxed">
            {message.content}
          </p>

          {/* Attachment card (if any) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2.5 space-y-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex max-w-sm items-center justify-between gap-3 rounded-xl border border-border/40 bg-[#0d1612] p-3 transition-all hover:border-emerald-500/40 hover:bg-[#0f1b15]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/20 text-muted-foreground">
                      <FileText className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        PDF • {att.size}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    title="Download attachment"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Download className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reactions row */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {message.reactions &&
              message.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  type="button"
                  onClick={() => onReact(message.id, reaction.emoji)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-all cursor-pointer ${
                    reaction.hasReacted
                      ? "border-emerald-500/50 bg-[#0c2419] text-emerald-400"
                      : "border-border/40 bg-[#0d1612] text-muted-foreground hover:border-border/70 hover:text-foreground"
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-semibold text-[11px]">{reaction.count}</span>
                </button>
              ))}

            {/* Quick add reaction button on hover */}
            <button
              type="button"
              onClick={() => onReact(message.id, "❤️")}
              title="Add reaction"
              className="opacity-0 group-hover:opacity-100 transition-opacity flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/40 hover:text-foreground cursor-pointer"
            >
              <Smile className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
