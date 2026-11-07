import { useState, type KeyboardEvent } from "react";
import { Maximize2, Paperclip, Send, Smile } from "lucide-react";

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
    <div className="p-4 border-t border-border/40 shrink-0 bg-background">
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-[#0d1612] px-3.5 py-2 transition-all focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30">
        {/* Attachment & Emoji actions */}
        <button
          type="button"
          title="Attach file"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Paperclip className="size-4" />
        </button>

        <button
          type="button"
          title="Insert emoji"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
          className="flex-1 bg-transparent py-1 text-xs md:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />

        {/* Maximize & Send */}
        <button
          type="button"
          title="Expand"
          className="hidden sm:flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Maximize2 className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim()}
          className="h-8.5 shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <Send className="size-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
