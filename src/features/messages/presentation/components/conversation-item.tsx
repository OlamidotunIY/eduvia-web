import {
  Building2,
  Calculator,
  GraduationCap,
  Leaf,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { Conversation } from "@/shared/domain";
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
          <Avatar className="size-10 rounded-full border border-border/40">
            <AvatarImage
              src={conversation.avatar}
              alt={conversation.name}
              className="object-cover rounded-full"
            />
            <AvatarFallback className="rounded-full text-xs font-semibold bg-muted">
              {conversation.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {conversation.online && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
          )}
        </div>
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
    }[conversation.iconType ?? "users"] ?? Building2;

    return (
      <div className="relative shrink-0">
        <div
          className={`flex size-10 items-center justify-center rounded-xl border ${colorClasses} transition-all`}
        >
          <IconComponent className="size-4.5" />
        </div>
        {conversation.online && (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
        )}
      </div>
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer border ${
        isSelected
          ? "bg-[#0c2419] border-[#17432e]"
          : "border-transparent hover:bg-muted/20"
      }`}
    >
      {renderIcon()}

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`truncate text-xs font-medium text-foreground ${
              isSelected ? "font-semibold" : ""
            }`}
          >
            {conversation.name}
          </span>
          {conversation.lastMessageTime && (
            <span
              className={`shrink-0 text-[11px] ${
                isSelected ? "text-emerald-400 font-medium" : "text-muted-foreground/70"
              }`}
            >
              {conversation.lastMessageTime}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-[11px] text-muted-foreground group-hover:text-foreground/80 transition-colors">
            {conversation.lastMessage ?? "No messages yet"}
          </span>

          {conversation.unreadCount > 0 && (
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
