import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  CalendarDays,
  Target,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import type {
  OrgStudentProgressItem,
  MasteryTier,
} from "@/shared/domain";

interface StudentProfileBannerProps {
  student?: OrgStudentProgressItem | null;
  isLoading?: boolean;
}

export function StudentProfileBanner({
  student,
  isLoading,
}: StudentProfileBannerProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        <Skeleton className="h-8 w-44 rounded-md" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  const s = student;
  const initials = s
    ? `${s.firstName?.[0] ?? ""}${s.lastName?.[0] ?? ""}`.toUpperCase()
    : "ST";
  const metrics = s?.summary;
  const masteryLevel = metrics?.overallMasteryLevel ?? 0;
  const tier: MasteryTier = metrics?.masteryTier ?? "Needs Support";

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top back navigation button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(APP_ROUTES.STUDENT_PROGRESS)}
          className="gap-2 text-xs font-medium text-muted-foreground hover:text-foreground h-8 px-2.5"
        >
          <ArrowLeft className="size-3.5" />
          Back to Student Progress
        </Button>
      </div>

      {/* Hero Profile Card */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Avatar, Name, Email, Classrooms */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20 shrink-0">
                {s?.image && <AvatarImage src={s.image} alt={s.firstName} />}
                <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold font-heading tracking-tight text-foreground truncate">
                    {s ? `${s.firstName} ${s.lastName}` : "Learner Profile"}
                  </h1>
                  {s?.gradeLevel && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      Grade: {s.gradeLevel}
                    </Badge>
                  )}
                  <MasteryTierBadge tier={tier} />
                </div>

                <p className="text-xs text-muted-foreground truncate">{s?.email}</p>

                {/* Enrolled Classrooms */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-0.5">
                    <BookOpen className="size-3" /> Classrooms:
                  </span>
                  {s?.classrooms && s.classrooms.length > 0 ? (
                    s.classrooms.map((c) => (
                      <Badge
                        key={c.id}
                        variant="outline"
                        className="text-[11px] font-normal"
                      >
                        {c.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">
                      None assigned
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Overall Mastery Progress Gauge */}
            <div className="flex flex-col gap-2 min-w-[220px] md:max-w-[280px] rounded-lg border border-border/50 bg-background/50 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Overall Mastery
                </span>
                <span className="text-sm font-bold text-foreground">
                  {masteryLevel}%
                </span>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getMasteryBarColor(
                    tier,
                  )}`}
                  style={{ width: `${Math.min(100, Math.max(0, masteryLevel))}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tier status: <strong className="text-foreground">{tier}</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          label="Topics Mastered"
          value={metrics?.masteredTopicsCount ?? 0}
          detail={`${metrics?.inProgressTopicsCount ?? 0} in progress`}
        />
        <MetricCard
          icon={CalendarDays}
          iconColor="text-blue-500"
          label="Lessons Attended"
          value={metrics?.totalLessonsAttended ?? 0}
          detail={
            (metrics?.totalLessonsMissed ?? 0) > 0
              ? `${metrics?.totalLessonsMissed} missed`
              : "0 missed"
          }
        />
        <MetricCard
          icon={Target}
          iconColor="text-primary"
          label="Average Score"
          value={
            metrics?.averageScorePercent !== null &&
            metrics?.averageScorePercent !== undefined
              ? `${metrics.averageScorePercent}%`
              : "—"
          }
          detail="Across completed tests"
        />
        <MetricCard
          icon={Clock}
          iconColor="text-amber-500"
          label="Last Lesson"
          value={
            metrics?.lastLessonAt
              ? new Date(metrics.lastLessonAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })
              : "—"
          }
          detail={
            metrics?.lastLessonAt
              ? new Date(metrics.lastLessonAt).toLocaleDateString([], {
                  year: "numeric",
                })
              : "No lessons logged"
          }
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  iconColor,
  label,
  value,
  detail,
}: {
  icon: any;
  iconColor: string;
  label: string;
  value: React.ReactNode;
  detail: string;
}) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <Icon className={`size-4 ${iconColor}`} />
        </div>
        <div>
          <div className="text-xl font-bold font-heading text-foreground">
            {value}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MasteryTierBadge({ tier }: { tier: MasteryTier }) {
  switch (tier) {
    case "Mastered":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs px-2 py-0.5"
        >
          Mastered
        </Badge>
      );
    case "Proficient":
      return (
        <Badge
          variant="outline"
          className="bg-sky-500/10 text-sky-500 border-sky-500/20 text-xs px-2 py-0.5"
        >
          Proficient
        </Badge>
      );
    case "In Progress":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs px-2 py-0.5"
        >
          In Progress
        </Badge>
      );
    case "Needs Support":
    default:
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs px-2 py-0.5"
        >
          Needs Support
        </Badge>
      );
  }
}

function getMasteryBarColor(tier: MasteryTier): string {
  switch (tier) {
    case "Mastered":
      return "bg-emerald-500";
    case "Proficient":
      return "bg-sky-500";
    case "In Progress":
      return "bg-blue-500";
    case "Needs Support":
    default:
      return "bg-amber-500";
  }
}
