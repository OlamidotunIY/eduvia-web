import { useState, useMemo } from "react";
import {
  CalendarDays,
  CheckCheck,
  CreditCard,
  FileText,
  Inbox,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../../application/use-notifications";
import { NotificationItemRow } from "../components/notification-item";
import { NotificationEmptyState } from "../components/notification-empty-state";
import type { NotificationCategory } from "../../domain/notification.types";

export function NotificationsPage() {
  const [activeCategory, setActiveCategory] =
    useState<NotificationCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notifications = [], isLoading } = useNotificationsQuery();
  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery();

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  // Filter notifications by category and search keyword
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Category Filter
      if (activeCategory === "unread" && item.status !== "unread") {
        return false;
      }
      if (activeCategory === "lessons" && !item.type.startsWith("lesson_")) {
        return false;
      }
      if (
        activeCategory === "reports" &&
        !item.type.startsWith("report_") &&
        item.type !== "marking_pending"
      ) {
        return false;
      }
      if (
        activeCategory === "billing" &&
        !item.type.startsWith("subscription_")
      ) {
        return false;
      }
      if (
        activeCategory === "system" &&
        !item.type.startsWith("org_") &&
        !item.type.startsWith("teacher_") &&
        item.type !== "account_verification" &&
        item.type !== "password_reset"
      ) {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchBody = item.body.toLowerCase().includes(query);
        const matchSubject = item.data?.subject
          ?.toString()
          .toLowerCase()
          .includes(query);
        const matchChild = item.data?.childName
          ?.toString()
          .toLowerCase()
          .includes(query);
        return matchTitle || matchBody || matchSubject || matchChild;
      }

      return true;
    });
  }, [notifications, activeCategory, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => n.status === "unread").length,
      lessons: notifications.filter((n) => n.type.startsWith("lesson_")).length,
      reports: notifications.filter(
        (n) => n.type.startsWith("report_") || n.type === "marking_pending",
      ).length,
      billing: notifications.filter((n) => n.type.startsWith("subscription_"))
        .length,
      system: notifications.filter(
        (n) =>
          n.type.startsWith("org_") ||
          n.type.startsWith("teacher_") ||
          n.type === "account_verification" ||
          n.type === "password_reset",
      ).length,
    };
  }, [notifications]);

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const isFiltered = Boolean(searchQuery.trim() || activeCategory !== "all");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Activity & Notifications
            </p>
            {unreadCount > 0 && (
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0"
              >
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
            Stay informed on upcoming lesson schedules, curriculum reports, tutor
            messages, and account notices.
          </p>
        </div>

        {/* Header Action: Mark all as read */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 px-3 text-xs font-medium shadow-2xs"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
          >
            <CheckCheck className="size-3.5 text-primary" />
            <span>Mark all as read</span>
          </Button>
        </div>
      </div>

      {/* Toolbar: Category Tabs & Keyword Search */}
      <div className="flex flex-col gap-3">
        {/* Category Tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={(val) => setActiveCategory(val as NotificationCategory)}
          className="w-full"
        >
          <TabsList
            variant="line"
            aria-label="Notification categories"
            className="h-auto w-full justify-start gap-1 sm:gap-2 rounded-none border-b border-border bg-transparent p-0 pb-1.5 overflow-x-auto scrollbar-none flex-nowrap"
          >
            <TabsTrigger
              value="all"
              className="h-8 flex-none rounded-lg px-3 text-xs font-medium after:inset-x-2 after:-bottom-[7px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            >
              <Inbox className="size-3.5 mr-1.5" />
              <span>All</span>
              <span className="ml-1.5 text-[11px] text-muted-foreground">
                ({categoryCounts.all})
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="unread"
              className="h-8 flex-none rounded-lg px-3 text-xs font-medium after:inset-x-2 after:-bottom-[7px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            >
              <span className="size-1.5 rounded-full bg-primary mr-1.5" />
              <span>Unread</span>
              {categoryCounts.unread > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 text-[10px] px-1.5 py-0 h-4 bg-primary/15 text-primary font-semibold"
                >
                  {categoryCounts.unread}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="lessons"
              className="h-8 flex-none rounded-lg px-3 text-xs font-medium after:inset-x-2 after:-bottom-[7px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            >
              <CalendarDays className="size-3.5 mr-1.5 text-primary/80" />
              <span>Lessons</span>
              <span className="ml-1.5 text-[11px] text-muted-foreground">
                ({categoryCounts.lessons})
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="reports"
              className="h-8 flex-none rounded-lg px-3 text-xs font-medium after:inset-x-2 after:-bottom-[7px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            >
              <FileText className="size-3.5 mr-1.5 text-blue-500" />
              <span>Reports</span>
              <span className="ml-1.5 text-[11px] text-muted-foreground">
                ({categoryCounts.reports})
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="billing"
              className="h-8 flex-none rounded-lg px-3 text-xs font-medium after:inset-x-2 after:-bottom-[7px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            >
              <CreditCard className="size-3.5 mr-1.5 text-amber-500" />
              <span>Billing</span>
              <span className="ml-1.5 text-[11px] text-muted-foreground">
                ({categoryCounts.billing})
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="system"
              className="h-8 flex-none rounded-lg px-3 text-xs font-medium after:inset-x-2 after:-bottom-[7px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            >
              <ShieldCheck className="size-3.5 mr-1.5 text-purple-500" />
              <span>System</span>
              <span className="ml-1.5 text-[11px] text-muted-foreground">
                ({categoryCounts.system})
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search input filter */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications by title, subject, child..."
            className="h-9 pl-9 text-xs bg-background/80"
          />
        </div>
      </div>

      {/* Notification Stream / Feed */}
      {isLoading ? (
        // Skeleton shimmer loading state
        <div className="rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xs overflow-hidden shadow-2xs divide-y divide-border/40">
          <div className="divide-y divide-border/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 animate-pulse"
              >
                <div className="size-2 rounded-full bg-muted/60 mt-2 shrink-0" />
                <div className="size-9 rounded-xl bg-muted/70 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted/70" />
                  <div className="h-3 w-3/4 rounded bg-muted/50" />
                  <div className="h-2.5 w-1/4 rounded bg-muted/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        // Borderless, card-free empty state
        <NotificationEmptyState
          isFiltered={isFiltered}
          onClearFilters={() => {
            setSearchQuery("");
            setActiveCategory("all");
          }}
        />
      ) : (
        // Borderless divided list inside feed container
        <div className="rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xs overflow-hidden shadow-2xs divide-y divide-border/40">
          {filteredNotifications.map((notification, index) => (
            <div
              key={notification.id}
              style={
                index > 6
                  ? {
                      contentVisibility: "auto",
                      containIntrinsicSize: "auto none auto 76px",
                    }
                  : undefined
              }
            >
              <NotificationItemRow
                notification={notification}
                onMarkRead={handleMarkRead}
                isMarkingRead={markReadMutation.isPending}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
