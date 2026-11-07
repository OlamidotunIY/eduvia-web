import { useState, type KeyboardEvent } from "react";
import { Maximize2, Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface MessageInputProps {
  conversationName: string;
  onSendMessage: (content: string) => void;
}

export function MessageInput({
  conversationName,
  onSendMessage,
}: MessageInputProps) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return;
    onSendMessage(content.trim());
    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3.5 pt-1.5 bg-card/40 border-t border-border/50">
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/20 px-3 py-1.5 transition-all focus-within:border-primary/60 focus-within:bg-background/80 focus-within:ring-1 focus-within:ring-primary/30">
        {/* Attachment & Emoji actions */}
        <button
          type="button"
          title="Attach file"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Paperclip className="size-4" />
        </button>

        <button
          type="button"
          title="Insert emoji"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Smile className="size-4" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Type a message to ${conversationName}...`}
          className="flex-1 bg-transparent py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />

        {/* Maximize & Send */}
        <button
          type="button"
          title="Expand"
          className="hidden sm:flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Maximize2 className="size-3.5" />
        </button>

        <Button
          onClick={handleSend}
          disabled={!content.trim()}
          className="h-8 shrink-0 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all gap-1.5 disabled:opacity-50"
        >
          <Send className="size-3.5" />
          <span>Send</span>
        </Button>
      </div>
    </div>
  );
}
