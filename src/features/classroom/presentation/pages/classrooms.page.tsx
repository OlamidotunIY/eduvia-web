import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { classroomRoute } from "@/shared/constant/routes.constants";
import { sessionStore } from "@/shared/store";
import type { Classroom } from "@/shared/domain";
import {
  useClassroomsQuery,
  useCreateClassroomMutation,
  useOrganizationSubjectsQuery,
  useScheduleLessonMutation,
  useAddLearnerMutation,
  useLearnerCandidatesQuery,
} from "../../application";
import { CreateClassroomDialog } from "../components/create-classroom-dialog";
import {
  AddLearnerDialog,
  ScheduleLessonDialog,
} from "../components/classroom-action-dialogs";
import { ClassroomsTable } from "../components/classrooms-table";

export function ClassroomsPage() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [scheduleClassroom, setScheduleClassroom] = useState<Classroom | null>(
    null,
  );
  const [learnerClassroom, setLearnerClassroom] = useState<Classroom | null>(
    null,
  );
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const classrooms = useClassroomsQuery(organizationId);
  const subjects = useOrganizationSubjectsQuery(organizationId);
  const createClassroom = useCreateClassroomMutation(organizationId);
  const scheduleLessonMutation = useScheduleLessonMutation(
    organizationId,
    scheduleClassroom?.id,
  );
  const addLearnerMutation = useAddLearnerMutation(
    organizationId,
    learnerClassroom?.id,
  );
  const learnerCandidates = useLearnerCandidatesQuery(
    organizationId,
    learnerClassroom?.id,
  );
  const canCreate = permissions.includes("classrooms:create");

  const openClassroom = useCallback(
    (classroom: Classroom) => navigate(classroomRoute(classroom.id)),
    [navigate],
  );
  const manageStudents = useCallback(
    (classroom: Classroom) => setLearnerClassroom(classroom),
    [],
  );
  const scheduleLesson = useCallback(
    (classroom: Classroom) => setScheduleClassroom(classroom),
    [],
  );
  const createAction = useMemo(
    () => (
      <Button
        disabled={!canCreate}
        title={
          canCreate
            ? undefined
            : "You need classroom creation permission to create a classroom."
        }
        onClick={() => setIsCreateOpen(true)}
      >
        <Plus />
        Create classroom
      </Button>
    ),
    [canCreate],
  );

  if (!organizationId) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-start py-16">
        <p className="text-sm font-medium text-primary">Classrooms</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Choose an organization first
        </h1>
        <p className="mt-3 text-muted-foreground">
          A classroom belongs to an organization. Select one from the workspace
          switcher, then return here.
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Teaching workspace</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Classrooms
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Organise learner groups, recurring lessons, and the teaching work
            that happens around them.
          </p>
        </div>
        {createAction}
      </div>
      {classrooms.error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {classrooms.error instanceof Error
            ? classrooms.error.message
            : "We could not load classrooms."}
        </p>
      ) : null}
      {subjects.error ? (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          Subjects could not be loaded. Classroom names and schedules are still
          available.
        </p>
      ) : null}
      <ClassroomsTable
        classrooms={classrooms.data ?? []}
        subjects={subjects.data ?? []}
        isLoading={classrooms.isPending}
        isReloading={classrooms.isFetching && !classrooms.isPending}
        onReload={() => void classrooms.refetch()}
        onOpen={openClassroom}
        onManageStudents={manageStudents}
        onScheduleLesson={scheduleLesson}
        emptyAction={createAction}
      />
      <CreateClassroomDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        subjects={subjects.data ?? []}
        isSubmitting={createClassroom.isPending}
        error={
          createClassroom.error instanceof Error ? createClassroom.error : null
        }
        onSubmit={(input) =>
          createClassroom.mutate(
            {
              ...input,
              primaryTeacherId: currentUser!.user.id,
              recurrenceTimezone:
                Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            { onSuccess: () => setIsCreateOpen(false) },
          )
        }
      />
      <ScheduleLessonDialog
        open={Boolean(scheduleClassroom)}
        onOpenChange={(open) => !open && setScheduleClassroom(null)}
        isSubmitting={scheduleLessonMutation.isPending}
        onSubmit={(input) =>
          scheduleLessonMutation.mutate(input, {
            onSuccess: () => setScheduleClassroom(null),
          })
        }
      />
      <AddLearnerDialog
        open={Boolean(learnerClassroom)}
        onOpenChange={(open) => !open && setLearnerClassroom(null)}
        learners={learnerCandidates.data ?? []}
        isSubmitting={addLearnerMutation.isPending}
        onSubmit={(studentId) =>
          addLearnerMutation.mutate(studentId, {
            onSuccess: () => setLearnerClassroom(null),
          })
        }
      />
    </section>
  );
}
