import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { sessionStore } from "@/shared/store";
import {
  useOrgStudentsProgressQuery,
} from "../../application";
import {
  StudentProfileBanner,
  StudentMasteryTree,
  StudentLessonHistory,
  LessonReportDrawer,
} from "../components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Sparkles, History } from "lucide-react";

export function StudentProgressProfilePage() {
  const { studentId = "" } = useParams<{ studentId: string }>();
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;

  const [activeTab, setActiveTab] = useState<string>("mastery");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Fetch organization learners to retrieve this learner's basic metadata & aggregated metrics
  const { data: orgData, isLoading } = useOrgStudentsProgressQuery(
    organizationId,
  );

  const currentStudent = useMemo(() => {
    if (!orgData?.students) return null;
    return orgData.students.find((s) => s.studentId === studentId) ?? null;
  }, [orgData, studentId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 w-full">
      {/* Top Banner with Learner Details, Badges & Quick Stats */}
      <StudentProfileBanner
        student={currentStudent}
        isLoading={isLoading && !currentStudent}
      />

      {/* Profile Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="gap-4 w-full"
      >
        <TabsList
          variant="line"
          aria-label="Student progress sections"
          className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent p-0 pb-2 overflow-x-auto scrollbar-none flex-nowrap"
        >
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="mastery"
          >
            <Sparkles className="size-3.5" /> Curriculum Mastery Graph
          </TabsTrigger>
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="lessons"
          >
            <History className="size-3.5" /> Lesson History & Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mastery" className="pt-2 outline-none">
          <StudentMasteryTree
            studentId={studentId}
            orgId={organizationId}
          />
        </TabsContent>

        <TabsContent value="lessons" className="pt-2 outline-none">
          <StudentLessonHistory
            studentId={studentId}
            orgId={organizationId}
            onSelectReport={(reportId) => setSelectedReportId(reportId)}
          />
        </TabsContent>
      </Tabs>

      {/* Slide-over Wide Report Drawer (60%-70% width on desktop, 100% on mobile) */}
      <LessonReportDrawer
        open={Boolean(selectedReportId)}
        onOpenChange={(open) => {
          if (!open) setSelectedReportId(null);
        }}
        reportId={selectedReportId}
        orgId={organizationId}
      />
    </div>
  );
}
