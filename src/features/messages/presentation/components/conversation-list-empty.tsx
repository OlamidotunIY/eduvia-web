import { Plus } from "lucide-react";
import emptyChatListIllustration from "@/assets/eduvia_empty_chat_list_transparent.png";
import { Button } from "@/shared/ui/button";

interface ConversationListEmptyProps {
  onStartNewChat: () => void;
}

export function ConversationListEmpty({
  onStartNewChat,
}: ConversationListEmptyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <img
        src={emptyChatListIllustration}
        alt="No conversations yet"
        className="mb-4 h-40 w-40 object-contain drop-shadow-md select-none"
      />
      <h3 className="font-heading text-base font-bold text-foreground">
        No conversations yet
      </h3>
      <p className="mt-1.5 max-w-[200px] text-xs text-muted-foreground leading-relaxed">
        Start a new chat with staff, learners, or groups.
      </p>
      <Button
        onClick={onStartNewChat}
        className="mt-5 h-8.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all gap-1.5"
      >
        <Plus className="size-3.5" />
        <span>Start new chat</span>
      </Button>
    </div>
  );
}
