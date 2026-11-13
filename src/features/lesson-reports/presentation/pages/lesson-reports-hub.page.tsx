import { useState, useMemo } from "react";
import { sessionStore } from "@/shared/store";
import {
  useOrgReportsQuery,
  useMissingReportLessonsQuery,
} from "../../application";
import {
  LessonReportsKPIs,
  LessonReportsTable,
  MissingReportsTable,
  CreateReportDialog,
  LessonReportDrawer,
} from "../components";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FilePlus2,
} from "lucide-react";
import type { MissingReportLessonItem } from "@/shared/domain";

type HubTab = "all" | "needs_review" | "submitted" | "missing";

export function LessonReportsHubPage() {
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;

  const [activeTab, setActiveTab] = useState<HubTab>("all");
  const [selectedClassroomId, setSelectedClassroomId] = useState<
    string | undefined
  >(undefined);
  const [selectedSubjectId, setSelectedSubjectId] = useState<
    string | undefined
  >(undefined);
  const [selectedAttendance, setSelectedAttendance] = useState<string>("all");

  // Drawer & Dialog state
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [preselectedLesson, setPreselectedLesson] =
    useState<MissingReportLessonItem | null>(null);

  const statusFilter =
    activeTab === "needs_review"
      ? "needs_review"
      : activeTab === "submitted"
        ? "submitted"
        : undefined;

  const {
    data: reportsData,
    isLoading: isReportsLoading,
    isFetching: isReportsFetching,
    refetch: refetchReports,
  } = useOrgReportsQuery(organizationId, {
    status: statusFilter,
    classroomId: selectedClassroomId,
    subjectId: selectedSubjectId,
    attendanceStatus:
      selectedAttendance !== "all" ? selectedAttendance : undefined,
  });

  const {
    data: missingLessons = [],
    isLoading: isMissingLoading,
    isFetching: isMissingFetching,
    refetch: refetchMissing,
  } = useMissingReportLessonsQuery(organizationId);

  const meta = reportsData?.meta;
  const reports = reportsData?.reports ?? [];

  const selectedReportMeta = useMemo(
    () => reports.find((r) => r.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );

  const handleOpenCreateEmpty = () => {
    setPreselectedLesson(null);
    setIsCreateOpen(true);
  };

  const handleDraftForMissingLesson = (lesson: MissingReportLessonItem) => {
    setPreselectedLesson(lesson);
    setIsCreateOpen(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-foreground">
            Lesson Reports
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Review completed lesson outcomes, approve AI summaries, and share learner progress with parents.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateEmpty}
          className="gap-1.5 text-xs h-9 self-start sm:self-auto shrink-0"
        >
          <FilePlus2 className="size-4" />
          <span>Draft Report</span>
        </Button>
      </div>

      {/* Aggregate KPI Cards */}
      <LessonReportsKPIs meta={meta} isLoading={isReportsLoading} />

      {/* Status Filter Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as HubTab)}
        className="gap-4 w-full"
      >
        <TabsList
          variant="line"
          aria-label="Lesson report categories"
          className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent p-0 pb-2 overflow-x-auto scrollbar-none flex-nowrap"
        >
          <TabsTrigger
            value="all"
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
          >
            <FileText className="size-3.5" />
            All Reports
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              {meta?.total ?? 0}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="needs_review"
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
          >
            <Clock className="size-3.5" />
            Needs Review
            <Badge
              variant="secondary"
              className={`ml-1 text-[10px] px-1.5 py-0 ${
                (meta?.totalNeedsReview ?? 0) > 0
                  ? "bg-amber-500/15 text-amber-500"
                  : ""
              }`}
            >
              {meta?.totalNeedsReview ?? 0}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="submitted"
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
          >
            <CheckCircle2 className="size-3.5" />
            Submitted
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              {meta?.totalSubmitted ?? 0}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="missing"
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
          >
            <AlertCircle className="size-3.5" />
            Missing Reports
            <Badge
              variant="secondary"
              className={`ml-1 text-[10px] px-1.5 py-0 ${
                (meta?.totalMissingLessons ?? missingLessons.length) > 0
                  ? "bg-rose-500/15 text-rose-500"
                  : ""
              }`}
            >
              {meta?.totalMissingLessons ?? missingLessons.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-1 outline-none">
          <LessonReportsTable
            reports={reports}
            isLoading={isReportsLoading}
            isReloading={isReportsFetching}
            onReload={() => refetchReports()}
            onSelectReport={(id) => setSelectedReportId(id)}
            selectedClassroomId={selectedClassroomId}
            onSelectClassroom={setSelectedClassroomId}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
            selectedAttendance={selectedAttendance}
            onSelectAttendance={setSelectedAttendance}
            availableClassrooms={meta?.classrooms ?? []}
            availableSubjects={meta?.subjects ?? []}
          />
        </TabsContent>

        <TabsContent value="needs_review" className="pt-1 outline-none">
          <LessonReportsTable
            reports={reports}
            isLoading={isReportsLoading}
            isReloading={isReportsFetching}
            onReload={() => refetchReports()}
            onSelectReport={(id) => setSelectedReportId(id)}
            selectedClassroomId={selectedClassroomId}
            onSelectClassroom={setSelectedClassroomId}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
            selectedAttendance={selectedAttendance}
            onSelectAttendance={setSelectedAttendance}
            availableClassrooms={meta?.classrooms ?? []}
            availableSubjects={meta?.subjects ?? []}
          />
        </TabsContent>

        <TabsContent value="submitted" className="pt-1 outline-none">
          <LessonReportsTable
            reports={reports}
            isLoading={isReportsLoading}
            isReloading={isReportsFetching}
            onReload={() => refetchReports()}
            onSelectReport={(id) => setSelectedReportId(id)}
            selectedClassroomId={selectedClassroomId}
            onSelectClassroom={setSelectedClassroomId}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
            selectedAttendance={selectedAttendance}
            onSelectAttendance={setSelectedAttendance}
            availableClassrooms={meta?.classrooms ?? []}
            availableSubjects={meta?.subjects ?? []}
          />
        </TabsContent>

        <TabsContent value="missing" className="pt-1 outline-none">
          <MissingReportsTable
            lessons={missingLessons}
            isLoading={isMissingLoading}
            isReloading={isMissingFetching}
            onReload={() => refetchMissing()}
            onDraftReport={handleDraftForMissingLesson}
          />
        </TabsContent>
      </Tabs>

      {/* Slide-over Quick Review & Edit Drawer with Expand button */}
      <LessonReportDrawer
        open={Boolean(selectedReportId)}
        onOpenChange={(open) => {
          if (!open) setSelectedReportId(null);
        }}
        reportId={selectedReportId}
        reportMeta={selectedReportMeta}
        orgId={organizationId}
      />

      {/* Draft Report Creator Dialog */}
      {organizationId && (
        <CreateReportDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          orgId={organizationId}
          preselectedLesson={preselectedLesson}
          availableLessons={missingLessons}
          onReportCreated={(newReportId) => {
            setSelectedReportId(newReportId);
          }}
        />
      )}
    </div>
  );
}
