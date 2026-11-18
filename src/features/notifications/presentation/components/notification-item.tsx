import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import type { NotificationItem } from "../../domain/notification.types";

interface NotificationItemProps {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  isMarkingRead?: boolean;
}

export function NotificationItemRow({
  notification,
  onMarkRead,
  isMarkingRead,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const isUnread = notification.status === "unread";

  // Contextual icon and color scheme based on notification type
  const { icon: Icon, badgeStyle, categoryLabel } = getNotificationMetadata(
    notification.type,
  );

  // Derive target action route from notification type and payload data
  const actionTarget = getNotificationActionRoute(notification);

  const relativeTime = (() => {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
      });
    } catch {
      return "Recently";
    }
  })();

  const handleRowClick = () => {
    if (isUnread) {
      onMarkRead(notification.id);
    }
    if (actionTarget) {
      navigate(actionTarget.route);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-start justify-between gap-4 py-4 px-4 transition-all duration-150 cursor-pointer border-b border-border/40 last:border-b-0 hover:bg-muted/30 ${
        isUnread ? "bg-primary/[0.02]" : "opacity-90"
      }`}
    >
      {/* Left indicator & icon */}
      <div className="flex items-start gap-3.5 min-w-0">
        {/* Unread dot */}
        <div className="pt-2 shrink-0">
          <span
            className={`block size-2 rounded-full transition-colors ${
              isUnread ? "bg-primary shadow-xs" : "bg-transparent"
            }`}
            title={isUnread ? "Unread notification" : "Read notification"}
          />
        </div>

        {/* Icon container */}
        <div
          className={`grid size-9 shrink-0 place-items-center rounded-xl border ${badgeStyle}`}
        >
          <Icon className="size-4.5" />
        </div>

        {/* Text Details */}
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm tracking-tight ${
                isUnread
                  ? "font-semibold text-foreground"
                  : "font-medium text-foreground/80"
              }`}
            >
              {notification.title}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0 border-border/60 bg-muted/40 font-normal text-muted-foreground"
            >
              {categoryLabel}
            </Badge>
          </div>

          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notification.body}
          </p>

          {/* Metadata badges and time */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-medium text-muted-foreground/80">
              {relativeTime}
            </span>

            {/* Context chips from data payload */}
            {notification.data?.subject && (
              <>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1 text-foreground/75 font-medium">
                  <BookOpen className="size-3 text-primary/70" />
                  {notification.data.subject}
                </span>
              </>
            )}

            {notification.data?.childName && (
              <>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1 text-foreground/75 font-medium">
                  <GraduationCap className="size-3 text-emerald-600 dark:text-emerald-400" />
                  {notification.data.childName}
                </span>
              </>
            )}

            {notification.data?.invoiceNumber && (
              <>
                <span className="text-border">·</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {notification.data.invoiceNumber}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div
        className="flex items-center gap-1.5 shrink-0 pt-1"
        onClick={(e) => e.stopPropagation()}
      >
        {actionTarget && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => {
              if (isUnread) onMarkRead(notification.id);
              navigate(actionTarget.route);
            }}
          >
            <span>{actionTarget.label}</span>
            <ArrowRight className="size-3" />
          </Button>
        )}

        {isUnread && (
          <Tooltip>
            <TooltipTrigger
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => onMarkRead(notification.id)}
              disabled={isMarkingRead}
              aria-label="Mark as read"
            >
              <Check className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Mark as read</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function getNotificationMetadata(type: string) {
  switch (type) {
    case "lesson_started":
      return {
        icon: Clock,
        badgeStyle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        categoryLabel: "Live Session",
      };
    case "lesson_scheduled":
    case "lesson_rescheduled":
    case "lesson_reminder_24h":
    case "lesson_reminder_1h":
      return {
        icon: CalendarDays,
        badgeStyle: "bg-primary/10 border-primary/20 text-primary",
        categoryLabel: "Lesson",
      };
    case "lesson_cancelled":
    case "lesson_no_show":
      return {
        icon: AlertTriangle,
        badgeStyle: "bg-destructive/10 border-destructive/20 text-destructive",
        categoryLabel: "Lesson Notice",
      };
    case "report_submitted":
    case "report_ai_draft_ready":
    case "marking_pending":
      return {
        icon: FileText,
        badgeStyle: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
        categoryLabel: "Academic Report",
      };
    case "subscription_created":
    case "subscription_renewed":
      return {
        icon: CreditCard,
        badgeStyle: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
        categoryLabel: "Billing",
      };
    case "subscription_payment_failed":
    case "subscription_cancelled":
      return {
        icon: ShieldAlert,
        badgeStyle: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
        categoryLabel: "Payment Notice",
      };
    case "teacher_application_received":
    case "teacher_application_result":
      return {
        icon: UserCheck,
        badgeStyle: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
        categoryLabel: "Application",
      };
    case "org_invitation_sent":
    case "org_approved":
      return {
        icon: Users,
        badgeStyle: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
        categoryLabel: "Organization",
      };
    case "new_message":
      return {
        icon: MessageSquare,
        badgeStyle: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
        categoryLabel: "Message",
      };
    default:
      return {
        icon: Bell,
        badgeStyle: "bg-muted border-border/60 text-muted-foreground",
        categoryLabel: "Notification",
      };
  }
}

function getNotificationActionRoute(
  notification: NotificationItem,
): { label: string; route: string } | null {
  const { type, data } = notification;

  if (type === "lesson_started" && data?.lessonId) {
    return {
      label: "Join Classroom",
      route: `${APP_ROUTES.LESSONS}/${data.lessonId}/board`,
    };
  }

  if (type.startsWith("lesson_") && data?.lessonId) {
    return {
      label: "View Lesson",
      route: `${APP_ROUTES.LESSONS}/${data.lessonId}`,
    };
  }

  if (type.startsWith("lesson_")) {
    return {
      label: "View Calendar",
      route: APP_ROUTES.CALENDAR,
    };
  }

  if (type.startsWith("report_") && data?.reportId) {
    return {
      label: "Read Report",
      route: `${APP_ROUTES.LESSON_REPORTS}/${data.reportId}`,
    };
  }

  if (type.startsWith("report_")) {
    return {
      label: "View Reports",
      route: APP_ROUTES.LESSON_REPORTS,
    };
  }

  if (type.startsWith("subscription_")) {
    return {
      label: "Manage Billing",
      route: APP_ROUTES.BILLING,
    };
  }

  if (type.startsWith("teacher_application")) {
    return {
      label: "View Applications",
      route: APP_ROUTES.APPLICATIONS,
    };
  }

  if (type === "new_message") {
    return {
      label: "Open Messages",
      route: APP_ROUTES.MESSAGES,
    };
  }

  return null;
}
