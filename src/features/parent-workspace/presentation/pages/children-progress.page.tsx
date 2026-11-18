import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  CalendarCheck2,
  History,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import {
  StudentMasteryTree,
  StudentLessonHistory,
  LessonReportDrawer,
} from "@/features/student-progress";
import { useParentChildrenQuery } from "../../application/use-parent-workspace";
import { AddChildDialog } from "../components/add-child-dialog";

export function ChildrenProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const childrenQuery = useParentChildrenQuery();
  const children = childrenQuery.data ?? [];

  const [activeTab, setActiveTab] = useState<string>("mastery");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);

  const activeChildId = searchParams.get("childId") || children[0]?.id || "";

  const selectedChild = useMemo(() => {
    return children.find((c) => c.id === activeChildId) ?? children[0] ?? null;
  }, [activeChildId, children]);

  const handleSelectChild = (id: string) => {
    setSearchParams({ childId: id });
  };

  const initials = selectedChild
    ? `${selectedChild.firstName?.[0] ?? ""}${
        selectedChild.lastName?.[0] ?? ""
      }`.toUpperCase()
    : "ST";

  const getTierBadge = (mastery: number) => {
    if (mastery >= 85) {
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
        >
          Mastered (Tier 1)
        </Badge>
      );
    }
    if (mastery >= 70) {
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold"
        >
          Proficient (Tier 2)
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold"
      >
        Developing (Tier 3)
      </Badge>
    );
  };

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col gap-6">
      {/* Page Header with Integrated Child Selector */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Learner Analytics & Insights
          </p>
          <h1 className="mt-1 font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Progress & Reports
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs md:text-sm text-muted-foreground">
            Examine curriculum node mastery, attendance rates, and individualized
            tutor feedback reports for each enrolled child.
          </p>
        </div>

        {/* Top Actions: Child Switcher & Register Child */}
        <div className="flex flex-wrap items-center gap-2.5">
          {children.length > 0 && (
            <Select
              value={selectedChild?.id ?? ""}
              onValueChange={handleSelectChild}
            >
              <SelectTrigger className="h-10 w-64 bg-card border-border shadow-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <Avatar className="size-6 border border-primary/20 shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold truncate">
                    {selectedChild?.firstName} {selectedChild?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({selectedChild?.gradeLevel})
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent align="end" className="w-64">
                {children.map((c) => {
                  const childInitials = `${c.firstName?.[0] ?? ""}${
                    c.lastName?.[0] ?? ""
                  }`.toUpperCase();
                  return (
                    <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5 shrink-0">
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                            {childInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {c.gradeLevel}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}

          <Button
            size="sm"
            variant="outline"
            className="h-10 gap-1.5 px-3 text-xs font-semibold shadow-xs"
            onClick={() => setIsAddChildOpen(true)}
          >
            <UserPlus className="size-3.5" />
            <span className="hidden sm:inline">Add Child</span>
          </Button>
        </div>
      </div>

      {/* Borderless Learner Profile Information Section */}
      {selectedChild ? (
        <div className="w-full py-1">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2">
            {/* Left: Avatar & Identity Details */}
            <div className="flex items-start sm:items-center gap-5">
              <Avatar className="size-16 sm:size-20 rounded-full border-2 border-primary/20 bg-muted/20 shadow-sm shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl font-bold font-heading">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-foreground truncate">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </h2>
                  <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">
                    {selectedChild.gradeLevel}
                  </Badge>
                  {getTierBadge(selectedChild.masteryPercentage)}
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground">
                  Born {new Date(selectedChild.dateOfBirth).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })} · {selectedChild.timezone}
                </p>

                {/* Enrolled Subjects Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {selectedChild.enrolledSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-0.5 text-xs font-medium text-foreground/90"
                    >
                      <span className="size-1.5 rounded-full bg-primary" />
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Borderless Key Performance Stats Strip */}
            <div className="flex items-center divide-x divide-border/70 shrink-0 pt-2 xl:pt-0">
              <div className="pr-6 sm:pr-8 text-left">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Award className="size-3.5 text-primary" />
                  <span className="font-medium">Mastery</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-primary">
                  {selectedChild.masteryPercentage}%
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Curriculum nodes
                </span>
              </div>

              <div className="px-6 sm:px-8 text-left">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <CalendarCheck2 className="size-3.5 text-emerald-500" />
                  <span className="font-medium">Attendance</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-emerald-600 dark:text-emerald-400">
                  {selectedChild.attendanceRate}%
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Session punctuality
                </span>
              </div>

              <div className="pl-6 sm:pl-8 text-left">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <BookOpen className="size-3.5 text-blue-500" />
                  <span className="font-medium">Lessons</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-foreground">
                  {selectedChild.completedLessonsCount}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Completed sessions
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="absolute size-20 rounded-full bg-primary/10 blur-xl pointer-events-none" />
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/15 via-primary/10 to-transparent border border-primary/20 text-primary shadow-xs">
              <Users className="size-6" />
            </div>
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            No children registered
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Add a child to view detailed curriculum mastery, attendance logs, and
            teacher feedback reports.
          </p>
          <Button
            size="sm"
            className="mt-4 gap-1.5 h-9 px-4 text-xs font-semibold shadow-xs"
            onClick={() => setIsAddChildOpen(true)}
          >
            <UserPlus className="size-3.5" />
            <span>Register Child</span>
          </Button>
        </div>
      )}

      {/* Tabs with Mastery Tree and Lesson History */}
      {selectedChild && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="gap-5 w-full mt-2"
        >
          <TabsList
            variant="line"
            aria-label="Student progress sections"
            className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent p-0 pb-2.5 overflow-x-auto scrollbar-none flex-nowrap"
          >
            <TabsTrigger
              className="h-9 flex-none rounded-lg px-4 text-xs sm:text-sm font-semibold transition-all relative after:absolute after:inset-x-2 after:-bottom-[11px] after:h-[2.5px] after:rounded-full after:bg-primary after:opacity-0 data-active:after:opacity-100 data-[selected]:after:opacity-100 data-active:bg-primary/15! data-active:text-primary! data-[selected]:bg-primary/15! data-[selected]:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary! dark:data-[selected]:bg-primary/20! dark:data-[selected]:text-primary!"
              value="mastery"
            >
              <Sparkles className="size-4 mr-2" />
              <span>Curriculum Mastery Graph</span>
            </TabsTrigger>
            <TabsTrigger
              className="h-9 flex-none rounded-lg px-4 text-xs sm:text-sm font-semibold transition-all relative after:absolute after:inset-x-2 after:-bottom-[11px] after:h-[2.5px] after:rounded-full after:bg-primary after:opacity-0 data-active:after:opacity-100 data-[selected]:after:opacity-100 data-active:bg-primary/15! data-active:text-primary! data-[selected]:bg-primary/15! data-[selected]:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary! dark:data-[selected]:bg-primary/20! dark:data-[selected]:text-primary!"
              value="lessons"
            >
              <History className="size-4 mr-2" />
              <span>Lesson History & Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mastery" className="pt-4 outline-none">
            <StudentMasteryTree studentId={selectedChild.id} />
          </TabsContent>

          <TabsContent value="lessons" className="pt-4 outline-none">
            <StudentLessonHistory
              studentId={selectedChild.id}
              onSelectReport={(reportId) => setSelectedReportId(reportId)}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Lesson Report Detail Slide-Over Drawer */}
      <LessonReportDrawer
        open={Boolean(selectedReportId)}
        onOpenChange={(open) => !open && setSelectedReportId(null)}
        reportId={selectedReportId}
      />

      {/* Register Child Dialog */}
      <AddChildDialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen} />
    </section>
  );
}
