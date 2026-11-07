import { useMemo, useState } from "react";
import { Conversation, type ConversationFilter } from "@/shared/domain";
import { ChatRoom } from "../components/chat-room";
import { ConversationList } from "../components/conversation-list";
import { MessagesHeader } from "../components/messages-header";
import { NewChatDialog, type ContactItem } from "../components/new-chat-dialog";
import { useMainHeaderSlot } from "@/app/shell/main/header";
import { sessionStore } from "@/shared/store";
import {
  useConversationsQuery,
  useConversationDetailQuery,
  useSendMessageMutation,
  useCreateConversationMutation,
} from "../../application";
import { useOrganizationMembersQuery } from "@/features/organization/application/queries/use-organization-members.query";

export function MessagesPage() {
  const { element: headerSlot } = useMainHeaderSlot();
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const currentUserId = currentUser?.user?.id;

  // Real backend query for organization members
  const { data: members = [] } = useOrganizationMembersQuery(organizationId);

  // Real backend query for user conversations
  const conversationsQuery = useConversationsQuery(
    organizationId,
    currentUserId,
    members,
  );
  const conversations: Conversation[] = conversationsQuery.data ?? [];

  // Active selected conversation
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Active conversation detail from backend (real messages)
  const detailQuery = useConversationDetailQuery(
    selectedId,
    currentUserId,
    members,
  );

  // Mutations for real messaging
  const sendMessageMutation = useSendMessageMutation(selectedId, organizationId);
  const createConversationMutation = useCreateConversationMutation(organizationId);

  // Filters and search
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  // Active conversation object (combines summary + detailed messages)
  const activeConversation = useMemo<Conversation | null>(() => {
    if (!selectedId) return null;
    const base = conversations.find((c) => c.id === selectedId);
    if (!base) return null;

    if (detailQuery.data) {
      return new Conversation({
        ...base,
        messages: detailQuery.data.messages,
      });
    }

    return base;
  }, [conversations, selectedId, detailQuery.data]);

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

  // Handlers
  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedId || !content.trim()) return;
    sendMessageMutation.mutate({
      content: content.trim(),
    });
  };

  const handleReact = (_messageId: string, _emoji: string) => {
    // Reaction handling placeholder for future websocket reaction events
  };

  const handleMarkAllAsRead = () => {
    // Optional mark read handler
  };

  const handleStartChatFromContact = async (contact: ContactItem) => {
    if (!organizationId || !currentUserId) return;

    // Check if conversation already exists with this contact
    const existing = conversations.find((c) => c.id === contact.id);
    if (existing) {
      setSelectedId(existing.id);
      return;
    }

    try {
      const res = (await createConversationMutation.mutateAsync({
        orgId: organizationId,
        type: "student_teacher",
        participants: [currentUserId, contact.id],
        studentId: contact.id,
        subject: `Chat with ${contact.name}`,
      })) as { id?: string; conversationId?: string } | undefined;
      const createdId = res?.id || res?.conversationId;
      if (createdId) {
        setSelectedId(createdId);
      }
    } catch {
      // Fallback: create conversation with general params
      try {
        const res = (await createConversationMutation.mutateAsync({
          orgId: organizationId,
          type: "parent_admin",
          participants: [currentUserId, contact.id],
          parentId: contact.id,
          subject: `Chat with ${contact.name}`,
        })) as { id?: string; conversationId?: string } | undefined;
        const createdId = res?.id || res?.conversationId;
        if (createdId) {
          setSelectedId(createdId);
        }
      } catch (e) {
        console.error("Failed to start conversation:", e);
      }
    }
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

      {/* 2. Main Split Layout (Chat List & Chat Room flush against each other with zero gap) */}
      <div className="flex h-full w-full min-h-0 min-w-0 flex-1 overflow-hidden">
        {/* Left Column: Chat List */}
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
