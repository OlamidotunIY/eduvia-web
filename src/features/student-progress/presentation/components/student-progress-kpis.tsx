import React from "react";
import {
  Users,
  Award,
  BookOpenCheck,
  AlertTriangle,
} from "lucide-react";
import type { OrgStudentsProgressMeta } from "@/shared/domain";

interface StudentProgressKPIsProps {
  meta?: OrgStudentsProgressMeta;
  isLoading?: boolean;
}

export function StudentProgressKPIs({
  meta,
  isLoading,
}: StudentProgressKPIsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Total Enrolled Learners"
        value={isLoading ? "..." : (meta?.totalStudents ?? 0)}
        icon={Users}
        description="Active learners in this organization"
      />
      <MetricCard
        label="Average Mastery Rate"
        value={
          isLoading
            ? "..."
            : meta?.averageMasteryRate !== undefined
              ? `${meta.averageMasteryRate}%`
              : "—"
        }
        icon={Award}
        description="Across curriculum topic nodes"
        emphasis="emerald"
      />
      <MetricCard
        label="Lessons Attended"
        value={isLoading ? "..." : (meta?.totalLessonsAttended ?? 0)}
        icon={BookOpenCheck}
        description="Completed lesson occurrences"
      />
      <MetricCard
        label="Learners Needing Support"
        value={isLoading ? "..." : (meta?.studentsNeedingSupport ?? 0)}
        icon={AlertTriangle}
        description="Mastery < 50% or missed lessons"
        emphasis={
          (meta?.studentsNeedingSupport ?? 0) > 0 ? "amber" : undefined
        }
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
  emphasis?: "amber" | "emerald";
}) {
  const accent =
    emphasis === "amber"
      ? "text-amber-500 dark:text-amber-400"
      : emphasis === "emerald"
        ? "text-emerald-500 dark:text-emerald-400"
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
