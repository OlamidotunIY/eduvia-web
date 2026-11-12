import { useState } from "react";
import { sessionStore } from "@/shared/store";
import { useOrgStudentsProgressQuery } from "../../application";
import {
  StudentProgressKPIs,
  StudentProgressTable,
} from "../components";

export function StudentProgressHubPage() {
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;

  const [selectedClassroomId, setSelectedClassroomId] = useState<string | undefined>(
    undefined,
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(
    undefined,
  );
  const [selectedTier, setSelectedTier] = useState<string>("all");

  const { data, isLoading, isFetching, refetch } = useOrgStudentsProgressQuery(
    organizationId,
    {
      classroomId: selectedClassroomId,
      subjectId: selectedSubjectId,
      masteryTier: selectedTier !== "all" ? selectedTier : undefined,
    },
  );

  const meta = data?.meta;
  const students = data?.students ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-foreground">
          Student Progress
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Track curriculum mastery, attendance records, and learning trajectories across all learners in your organization.
        </p>
      </div>

      {/* Aggregate KPI Cards */}
      <StudentProgressKPIs
        meta={meta}
        isLoading={isLoading}
      />

      {/* Roster & Mastery Table with Filters */}
      <div className="flex flex-col gap-3">
        <StudentProgressTable
          students={students}
          isLoading={isLoading}
          isReloading={isFetching}
          onReload={() => refetch()}
          selectedClassroomId={selectedClassroomId}
          onSelectClassroom={setSelectedClassroomId}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={setSelectedSubjectId}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          availableClassrooms={meta?.classrooms ?? []}
          availableSubjects={meta?.subjects ?? []}
        />
      </div>
    </div>
  );
}
