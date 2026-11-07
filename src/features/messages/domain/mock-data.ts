import type { Conversation } from "./types";

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "teaching-staff",
    type: "group",
    name: "Teaching Staff",
    subtitle: "12 members • Internal staff room",
    iconColor: "emerald",
    iconType: "users",
    lastMessage: "Adenike: Assessment drafts are ready...",
    lastMessageTime: "10:24 AM",
    unreadCount: 3,
    isPinned: true,
    messages: [
      {
        id: "m-1",
        senderId: "u-adenike",
        senderName: "Adenike Okafor",
        senderAvatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
        createdAt: "9:02 AM",
        content:
          "Good morning, team! The assessment drafts for the mid-term are ready for review. Please check the questions in Eduvia's Question Bank by 3:00 PM so we can finalize and publish.",
        attachments: [
          {
            id: "att-1",
            name: "Mid-term_Assessment_Draft.pdf",
            size: "2.4 MB",
            mimeType: "application/pdf",
          },
        ],
        reactions: [
          { emoji: "👍", count: 4, users: ["Kunle Adebayo", "Chinwe Umeh", "Tunde Salami", "Iyanda Dotun"] },
          { emoji: "✅", count: 2, users: ["Kunle Adebayo", "Tunde Salami"] },
        ],
      },
      {
        id: "m-2",
        senderId: "u-kunle",
        senderName: "Kunle Adebayo",
        senderAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        createdAt: "9:38 AM",
        content:
          "I've reviewed the Math section. The questions look good overall. I flagged two items for minor edits (commented in the Question Bank).",
      },
      {
        id: "m-3",
        senderId: "u-chinwe",
        senderName: "Chinwe Umeh",
        senderAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
        createdAt: "10:06 AM",
        content:
          "Quick update on class scheduling: the Grade 10 Biology lab will move to Thursday, 11:00 AM (same lab). This avoids a clash with the Math practical.",
        reactions: [
          { emoji: "👍", count: 3, users: ["Adenike Okafor", "Kunle Adebayo", "Tunde Salami"] },
        ],
      },
      {
        id: "m-4",
        senderId: "u-tunde",
        senderName: "Tunde Salami",
        senderAvatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        createdAt: "10:18 AM",
        content:
          "Noted. I'll update the timetable in Eduvia now and notify the affected classes.",
        isUnreadDividerBefore: true,
      },
      {
        id: "m-5",
        senderId: "u-adenike",
        senderName: "Adenike Okafor",
        senderAvatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
        createdAt: "10:24 AM",
        content:
          "Great! Once the final questions are approved, I'll publish the assessment to the Grade 10 and 11 classrooms and share the schedule here.",
      },
    ],
  },
  {
    id: "darasimi-grade-10",
    type: "group",
    name: "Darasimi Grade 10",
    subtitle: "28 students • Grade 10 Homeroom",
    iconColor: "purple",
    iconType: "graduation",
    online: true,
    lastMessage: "Darasimi: Will the revision materials...",
    lastMessageTime: "9:48 AM",
    unreadCount: 1,
    messages: [
      {
        id: "dg-1",
        senderId: "u-darasimi",
        senderName: "Darasimi Bello",
        senderAvatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
        createdAt: "9:45 AM",
        content:
          "Good morning Mr. Salami, will the revision materials for Physics be uploaded today?",
      },
      {
        id: "dg-2",
        senderId: "u-tunde",
        senderName: "Tunde Salami",
        senderAvatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        createdAt: "9:48 AM",
        content:
          "Yes, Darasimi! They will be up by noon in your classroom resources tab.",
        isMine: true,
      },
    ],
  },
  {
    id: "math-department",
    type: "group",
    name: "Math Department",
    subtitle: "6 teachers • Mathematics faculty",
    iconColor: "blue",
    iconType: "calculator",
    lastMessage: "Kunle: Please review the question bank...",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "md-1",
        senderId: "u-kunle",
        senderName: "Kunle Adebayo",
        senderAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        createdAt: "Yesterday 4:15 PM",
        content:
          "Please review the question bank items for Senior Secondary 2 Algebra and Trigonometry.",
      },
    ],
  },
  {
    id: "parents-group",
    type: "group",
    name: "Parents Group",
    subtitle: "45 parents • Grade 10 PTA",
    iconColor: "amber",
    iconType: "users",
    lastMessage: "Parent (Mrs. Ade): Thank you for the update!",
    lastMessageTime: "Yesterday",
    unreadCount: 2,
    messages: [
      {
        id: "pg-1",
        senderId: "u-admin",
        senderName: "School Administration",
        createdAt: "Yesterday 2:00 PM",
        content:
          "Dear parents, kindly note that the mid-term assessment schedule has been published.",
      },
      {
        id: "pg-2",
        senderId: "u-parent-ade",
        senderName: "Parent (Mrs. Ade)",
        senderAvatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
        createdAt: "Yesterday 2:40 PM",
        content:
          "Thank you for the update! We will ensure the learners prepare adequately.",
      },
    ],
  },
  {
    id: "iyanda-dotun",
    type: "direct",
    name: "Iyanda Dotun",
    subtitle: "Academic Coordinator • Online",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
    online: true,
    lastMessage: "Can we sync on the new timetable?",
    lastMessageTime: "Mon",
    unreadCount: 0,
    messages: [
      {
        id: "id-1",
        senderId: "u-iyanda",
        senderName: "Iyanda Dotun",
        senderAvatar:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
        createdAt: "Mon 11:30 AM",
        content: "Hi Tunde, can we sync on the new timetable later this afternoon?",
      },
    ],
  },
  {
    id: "axora-admin",
    type: "direct",
    name: "Axora Admin",
    subtitle: "System Administrator",
    iconColor: "emerald",
    iconType: "shield",
    lastMessage: "The new question bank features are now...",
    lastMessageTime: "Mon",
    unreadCount: 0,
    messages: [
      {
        id: "aa-1",
        senderId: "u-axora",
        senderName: "Axora Admin",
        createdAt: "Mon 9:00 AM",
        content:
          "The new question bank features are now live in your workspace. Let us know if you need any assistance.",
      },
    ],
  },
  {
    id: "biology-teachers",
    type: "group",
    name: "Biology Teachers",
    subtitle: "4 teachers • Science faculty",
    iconColor: "leaf",
    iconType: "leaf",
    lastMessage: "Chinwe: Lab session for Grade 11 is...",
    lastMessageTime: "Mon",
    unreadCount: 0,
    messages: [
      {
        id: "bt-1",
        senderId: "u-chinwe",
        senderName: "Chinwe Umeh",
        senderAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
        createdAt: "Mon 8:15 AM",
        content:
          "Lab session for Grade 11 is confirmed for Wednesday morning.",
      },
    ],
  },
];
