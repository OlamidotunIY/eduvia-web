export type NotificationType =
  // Lesson events
  | "lesson_scheduled"
  | "lesson_reminder_24h"
  | "lesson_reminder_1h"
  | "lesson_started"
  | "lesson_cancelled"
  | "lesson_rescheduled"
  | "lesson_no_show"
  // Assessment + reports
  | "report_submitted"
  | "report_ai_draft_ready"
  | "marking_pending"
  // Org events
  | "teacher_application_received"
  | "teacher_application_result"
  | "org_invitation_sent"
  | "org_approved"
  // Billing
  | "subscription_created"
  | "subscription_renewed"
  | "subscription_payment_failed"
  | "subscription_cancelled"
  // Messages
  | "new_message"
  // System
  | "account_verification"
  | "password_reset";

export type NotificationChannel = "in_app" | "push" | "email" | "all";
export type NotificationStatus = "unread" | "read";

export interface NotificationItem {
  id: string;
  recipientId: string;
  type: NotificationType | string;
  title: string;
  body: string;
  data: Record<string, any>;
  channel: NotificationChannel | string;
  status: NotificationStatus | string;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
}

export type NotificationCategory =
  | "all"
  | "unread"
  | "lessons"
  | "reports"
  | "billing"
  | "system";
