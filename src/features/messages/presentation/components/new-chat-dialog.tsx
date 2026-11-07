import { useMemo, useState } from "react";
import { MessageSquare, Search, User, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useOrganizationMembersQuery } from "@/features/organization/application/queries/use-organization-members.query";
import { sessionStore } from "@/shared/store";
import type { OrganizationMemberRecord } from "@/shared/domain";

export interface ContactItem {
  id: string;
  name: string;
  role: string;
  type: "direct" | "group";
  avatar?: string;
  userId?: string;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: (contact: ContactItem) => void;
}

export function NewChatDialog({
  open,
  onOpenChange,
  onStartChat,
}: NewChatDialogProps) {
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const currentUserId = currentUser?.user?.id;

  const { data: members = [], isLoading } = useOrganizationMembersQuery(organizationId);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "direct" | "group">("all");

  const contacts = useMemo<ContactItem[]>(() => {
    // Map members (excluding current user) into contacts
    return members
      .filter((m: OrganizationMemberRecord) => m.userId !== currentUserId)
      .map((m: OrganizationMemberRecord) => {
        const fullName = `${m.user?.firstName ?? ""} ${m.user?.lastName ?? ""}`.trim();
        const displayName = fullName || m.user?.email || "Team Member";
        return {
          id: m.userId,
          userId: m.userId,
          name: displayName,
          role: m.role || "Member",
          type: "direct" as const,
          avatar: m.user?.image ?? undefined,
        };
      });
  }, [members, currentUserId]);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (selectedType !== "all" && c.type !== selectedType) return false;
      if (search.trim() && !c.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [contacts, selectedType, search]);

  const handleSelectContact = (contact: ContactItem) => {
    onStartChat(contact);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-border/60 bg-card">
        <DialogHeader className="p-4 pb-3 border-b border-border/50">
          <DialogTitle className="font-heading text-base font-bold text-foreground">
            New Message
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Start a direct message with a member from your active organization.
          </DialogDescription>
        </DialogHeader>

        {/* Filter buttons & Search */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/30 border border-border/40 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-colors text-center ${
                selectedType === "all"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("direct")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-colors text-center ${
                selectedType === "direct"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Direct
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("group")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-colors text-center ${
                selectedType === "group"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Groups
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="px-2 pb-3 max-h-72 overflow-y-auto space-y-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Loading members...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {contacts.length === 0
                ? "No other members found in this organization."
                : "No matching contacts found."}
            </div>
          ) : (
            filtered.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors text-left group"
              >
                <Avatar className="size-9 rounded-xl border border-border/40">
                  {contact.avatar && <AvatarImage src={contact.avatar} alt={contact.name} />}
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-semibold">
                    {contact.type === "group" ? (
                      <Users className="size-4" />
                    ) : contact.name.length >= 2 ? (
                      contact.name.slice(0, 2).toUpperCase()
                    ) : (
                      <User className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {contact.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {contact.role}
                  </div>
                </div>

                <div className="size-7 rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <MessageSquare className="size-3.5" />
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
