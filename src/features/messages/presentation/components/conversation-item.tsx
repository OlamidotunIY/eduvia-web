import {
  Calculator,
  GraduationCap,
  Leaf,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { Conversation } from "../../domain/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const renderIcon = () => {
    if (conversation.type === "direct" && conversation.avatar) {
      return (
        <div className="relative shrink-0">
          <Avatar className="size-10 rounded-xl border border-border/40">
            <AvatarImage
              src={conversation.avatar}
              alt={conversation.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-xl text-xs font-semibold bg-muted">
              {conversation.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {conversation.online && (
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
          )}
        </div>
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
      <div className="relative shrink-0">
        <div
          className={`flex size-10 items-center justify-center rounded-xl border ${colorClasses} transition-all`}
        >
          <IconComponent className="size-5" />
        </div>
        {conversation.online && (
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        )}
      </div>
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 p-2.5 text-left transition-all ${
        isSelected
          ? "rounded-xl border border-primary/30 bg-primary/10 shadow-xs"
          : "rounded-xl border border-transparent hover:border-border/40 hover:bg-muted/30"
      }`}
    >
      {renderIcon()}

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`truncate text-xs font-semibold ${
              isSelected ? "text-foreground font-bold" : "text-foreground"
            }`}
          >
            {conversation.name}
          </span>
          {conversation.lastMessageTime && (
            <span className="shrink-0 text-[11px] text-muted-foreground/70">
              {conversation.lastMessageTime}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-[11px] text-muted-foreground group-hover:text-foreground/80 transition-colors">
            {conversation.lastMessage ?? "No messages yet"}
          </span>

          {conversation.unreadCount > 0 && (
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
