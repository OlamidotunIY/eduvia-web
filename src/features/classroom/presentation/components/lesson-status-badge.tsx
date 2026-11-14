import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

const STATUS_META: Record<string, { label: string; badgeClass: string }> = {
  SCHEDULED: {
    label: "Scheduled",
    badgeClass: "border-primary/20 bg-primary/10 text-primary",
  },
  LIVE: {
    label: "Live",
    badgeClass: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  COMPLETED: {
    label: "Completed",
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  MARKING: {
    label: "Marking",
    badgeClass: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  REPORTED: {
    label: "Reported",
    badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  ARCHIVED: {
    label: "Archived",
    badgeClass: "border-border bg-muted text-muted-foreground",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  STUDENT_NO_SHOW: {
    label: "Student No-Show",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  TEACHER_NO_SHOW: {
    label: "Teacher No-Show",
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

export function LessonStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status.toUpperCase();
  const meta = STATUS_META[key] ?? {
    label: status.replaceAll("_", " "),
    badgeClass: "border-border bg-muted/60 text-foreground",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        meta.badgeClass,
        className,
      )}
    >
      {key === "LIVE" ? (
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
      ) : null}
      {meta.label}
    </Badge>
  );
}
