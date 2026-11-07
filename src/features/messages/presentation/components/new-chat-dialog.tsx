import { useState } from "react";
import { MessageSquare, Search, UsersRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

interface Contact {
  id: string;
  name: string;
  role: string;
  type: "direct" | "group";
  avatar?: string;
}

const AVAILABLE_CONTACTS: Contact[] = [
  {
    id: "teaching-staff",
    name: "Teaching Staff",
    role: "Internal Staff Room • 12 members",
    type: "group",
  },
  {
    id: "darasimi-grade-10",
    name: "Darasimi Grade 10",
    role: "Homeroom Class • 28 students",
    type: "group",
  },
  {
    id: "adenike-okafor",
    name: "Adenike Okafor",
    role: "Head of Academic Planning",
    type: "direct",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "kunle-adebayo",
    name: "Kunle Adebayo",
    role: "Mathematics Lead Teacher",
    type: "direct",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "chinwe-umeh",
    name: "Chinwe Umeh",
    role: "Senior Biology Teacher",
    type: "direct",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "iyanda-dotun",
    name: "Iyanda Dotun",
    role: "Academic Coordinator",
    type: "direct",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
  },
];

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: (contact: Contact) => void;
}

export function NewChatDialog({
  open,
  onOpenChange,
  onStartChat,
}: NewChatDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "direct" | "group">(
    "all",
  );

  const filtered = AVAILABLE_CONTACTS.filter((c) => {
    if (selectedType !== "all" && c.type !== selectedType) return false;
    if (search.trim() && !c.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-border/60 bg-card">
        <DialogHeader className="p-4 pb-3 border-b border-border/50">
          <DialogTitle className="font-heading text-base font-bold text-foreground">
            New Message
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Start a direct message with a colleague or chat with an official group.
          </DialogDescription>

          <div className="mt-3 relative flex items-center">
            <Search className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people or groups..."
              className="w-full rounded-xl border border-border/50 bg-muted/20 py-1.5 pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            {(["all", "direct", "group"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize transition-all ${
                  selectedType === type
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {type === "all" ? "All Contacts" : type === "direct" ? "Staff" : "Groups"}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No contacts found matching &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => {
                  onStartChat(contact);
                  onOpenChange(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-muted/30"
              >
                {contact.type === "direct" ? (
                  <Avatar className="size-9 rounded-xl border border-border/50">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback className="rounded-xl text-xs font-semibold bg-muted">
                      {contact.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/20 text-primary">
                    <UsersRound className="size-4.5" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-foreground">
                    {contact.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {contact.role}
                  </p>
                </div>

                <div className="shrink-0 text-muted-foreground">
                  <MessageSquare className="size-4" />
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
