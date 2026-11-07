import { useMemo, useState } from "react";
import { INITIAL_CONVERSATIONS } from "../../domain/mock-data";
import type { Conversation, ConversationFilter, Message } from "../../domain/types";
import { ChatRoom } from "../components/chat-room";
import { ConversationList } from "../components/conversation-list";
import { MessagesHeader } from "../components/messages-header";
import { NewChatDialog } from "../components/new-chat-dialog";
import { useMainHeaderSlot } from "@/app/shell/main/header";
import { sessionStore } from "@/shared/store";

export function MessagesPage() {
  const { element: headerSlot } = useMainHeaderSlot();
  const currentUser = sessionStore((state) => state.currentUser);

  // Conversations state (initialized with rich mock data matching the design)
  const [conversations, setConversations] =
    useState<Conversation[]>(INITIAL_CONVERSATIONS);

  // Active selected conversation (defaults to 'teaching-staff' to match the reference design)
  const [selectedId, setSelectedId] = useState<string | null>("teaching-staff");

  // Filters and search
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  // Compute filtered conversations list
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // 1. Unread Only filter (from header toggle)
      if (unreadOnly && c.unreadCount === 0) {
        return false;
      }

      // 2. Tab filter
      if (activeFilter === "unread" && c.unreadCount === 0) {
        return false;
      }
      if (activeFilter === "direct" && c.type !== "direct") {
        return false;
      }
      if (activeFilter === "groups" && c.type !== "group") {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesLast = c.lastMessage?.toLowerCase().includes(query);
        const matchesSubtitle = c.subtitle?.toLowerCase().includes(query);
        if (!matchesName && !matchesLast && !matchesSubtitle) {
          return false;
        }
      }

      return true;
    });
  }, [conversations, unreadOnly, activeFilter, searchQuery]);

  // Active conversation object
  const activeConversation = useMemo(() => {
    if (!selectedId) return null;
    return conversations.find((c) => c.id === selectedId) ?? null;
  }, [conversations, selectedId]);

  // Handlers
  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    // Mark as read when selected
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    );
  };

  const handleSendMessage = (content: string) => {
    if (!selectedId) return;

    const senderName =
      currentUser?.user.firstName && currentUser?.user.lastName
        ? `${currentUser.user.firstName} ${currentUser.user.lastName}`
        : "Tunde Salami";

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.user.id ?? "current-user",
      senderName,
      senderAvatar: currentUser?.user.image ?? undefined,
      createdAt: "Just now",
      content,
      isMine: true,
      reactions: [],
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== selectedId) return c;
        return {
          ...c,
          lastMessage: `You: ${content}`,
          lastMessageTime: "Just now",
          messages: [...c.messages, newMessage],
        };
      }),
    );
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (!selectedId) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== selectedId) return c;

        const updatedMessages = c.messages.map((m) => {
          if (m.id !== messageId) return m;

          const existingReactions = m.reactions ?? [];
          const existing = existingReactions.find((r) => r.emoji === emoji);

          if (existing) {
            if (existing.hasReacted) {
              // Remove user reaction
              return {
                ...m,
                reactions: existingReactions
                  .map((r) =>
                    r.emoji === emoji
                      ? { ...r, count: r.count - 1, hasReacted: false }
                      : r,
                  )
                  .filter((r) => r.count > 0),
              };
            } else {
              // Add user reaction
              return {
                ...m,
                reactions: existingReactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, count: r.count + 1, hasReacted: true }
                    : r,
                ),
              };
            }
          } else {
            // New reaction
            return {
              ...m,
              reactions: [
                ...existingReactions,
                { emoji, count: 1, users: ["You"], hasReacted: true },
              ],
            };
          }
        });

        return { ...c, messages: updatedMessages };
      }),
    );
  };

  const handleMarkAllAsRead = () => {
    setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
  };

  const handleStartChatFromContact = (contact: {
    id: string;
    name: string;
    type: "direct" | "group";
    avatar?: string;
    role?: string;
  }) => {
    const existing = conversations.find((c) => c.id === contact.id);
    if (existing) {
      setSelectedId(existing.id);
      return;
    }

    const newConv: Conversation = {
      id: contact.id,
      type: contact.type,
      name: contact.name,
      subtitle: contact.role ?? "Direct conversation",
      avatar: contact.avatar,
      iconColor: contact.type === "group" ? "emerald" : undefined,
      iconType: contact.type === "group" ? "users" : undefined,
      unreadCount: 0,
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedId(newConv.id);
  };

  return (
    <>
      {/* 1. Header with Title, Search ⌘K, Unread Toggle, New Chat Button */}
      <MessagesHeader
        headerSlot={headerSlot}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadOnly={unreadOnly}
        onToggleUnreadOnly={() => setUnreadOnly((prev) => !prev)}
        onOpenNewChat={() => setNewChatDialogOpen(true)}
      />

      {/* 2. Main Dual-Card Split Layout (Chat List & Chat Room) */}
      <div className="flex h-full w-full min-h-0 min-w-0 flex-1 gap-4 lg:gap-5 overflow-hidden">
        {/* Left Column: Chat List Card */}
        <ConversationList
          conversations={filteredConversations}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMarkAllAsRead={handleMarkAllAsRead}
          onStartNewChat={() => setNewChatDialogOpen(true)}
        />

        {/* Right Column: Chat Room or Empty State Card */}
        <ChatRoom
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          onReact={handleReact}
          onCreateNewMessage={() => setNewChatDialogOpen(true)}
          onBrowseContacts={() => setNewChatDialogOpen(true)}
        />
      </div>

      {/* 3. New Chat Modal Dialog */}
      <NewChatDialog
        open={newChatDialogOpen}
        onOpenChange={setNewChatDialogOpen}
        onStartChat={handleStartChatFromContact}
      />
    </>
  );
}
