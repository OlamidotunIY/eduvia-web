import React from "react";
import { FileText, Clock, AlertCircle, Star } from "lucide-react";
import type { OrgReportsMeta } from "@/shared/domain";

interface LessonReportsKPIsProps {
  meta?: OrgReportsMeta;
  isLoading?: boolean;
}

export function LessonReportsKPIs({
  meta,
  isLoading,
}: LessonReportsKPIsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Total Reports Logged"
        value={isLoading ? "..." : (meta?.total ?? 0)}
        icon={FileText}
        description="Drafts, AI reviews & submitted"
      />
      <MetricCard
        label="Pending Teacher Review"
        value={isLoading ? "..." : (meta?.totalNeedsReview ?? 0)}
        icon={Clock}
        description="Drafts & AI summaries waiting sign-off"
        emphasis={(meta?.totalNeedsReview ?? 0) > 0 ? "amber" : undefined}
      />
      <MetricCard
        label="Missing Reports"
        value={isLoading ? "..." : (meta?.totalMissingLessons ?? 0)}
        icon={AlertCircle}
        description="Completed lessons without a report"
        emphasis={(meta?.totalMissingLessons ?? 0) > 0 ? "rose" : undefined}
      />
      <MetricCard
        label="Average Lesson Rating"
        value={
          isLoading
            ? "..."
            : meta?.averageRating !== null && meta?.averageRating !== undefined
              ? `${meta.averageRating} / 5`
              : "—"
        }
        icon={Star}
        description="Overall engagement across submitted reports"
        emphasis="emerald"
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  emphasis,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  emphasis?: "amber" | "emerald" | "rose";
}) {
  const accent =
    emphasis === "amber"
      ? "text-amber-500 dark:text-amber-400"
      : emphasis === "emerald"
        ? "text-emerald-500 dark:text-emerald-400"
        : emphasis === "rose"
          ? "text-rose-500 dark:text-rose-400"
          : "text-primary";

  return (
    <div className="min-w-0 rounded-xl border bg-gradient-to-b from-card to-muted/20 p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-medium truncate">{label}</span>
        <div className={`p-1.5 rounded-lg bg-muted/50 ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground truncate">
        {description}
      </p>
    </div>
  );
}
