import { useCallback, useMemo, useState } from "react";
import { Layers3, PlayCircle, Plus, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { classroomRoute } from "@/shared/constant/routes.constants";
import { sessionStore } from "@/shared/store";
import type { Classroom } from "@/shared/domain";
import {
  useClassroomsQuery,
  useCreateClassroomMutation,
  useOrganizationSubjectsQuery,
  useAddLearnerMutation,
  useLearnerCandidatesQuery,
  useCloseClassroomMutation,
  usePauseClassroomMutation,
  useClassroomEnrollmentCounts,
} from "../../application";
import { CreateClassroomDialog } from "../components/create-classroom-dialog";
import { AddLearnerDialog } from "../components/classroom-action-dialogs";
import { ClassroomsTable } from "../components/classrooms-table";

export function ClassroomsPage() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [learnerClassroom, setLearnerClassroom] = useState<Classroom | null>(
    null,
  );
  const [lifecycleAction, setLifecycleAction] = useState<{
    classroom: Classroom;
    action: "pause" | "close";
  } | null>(null);
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const classrooms = useClassroomsQuery(organizationId);
  const subjects = useOrganizationSubjectsQuery(organizationId);
  const createClassroom = useCreateClassroomMutation(organizationId);
  const pauseClassroom = usePauseClassroomMutation(organizationId);
  const closeClassroom = useCloseClassroomMutation(organizationId);
  const addLearnerMutation = useAddLearnerMutation(
    organizationId,
    learnerClassroom?.id,
  );
  const learnerCandidates = useLearnerCandidatesQuery(
    organizationId,
    learnerClassroom?.id,
  );
  const canCreate = permissions.includes("classrooms:create");
  const classroomItems = classrooms.data ?? [];
  const enrollmentCounts = useClassroomEnrollmentCounts(
    organizationId,
    classroomItems,
  );
  const totalLearners = [...enrollmentCounts.values()].reduce(
    (total, count) => total + count,
    0,
  );
  const activeClassrooms = classroomItems.filter(
    (item) => item.status.toLowerCase() === "active",
  ).length;

  const openClassroom = useCallback(
    (classroom: Classroom) => navigate(classroomRoute(classroom.id)),
    [navigate],
  );
  const manageStudents = useCallback(
    (classroom: Classroom) => setLearnerClassroom(classroom),
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
  const canUpdate = permissions.includes("classrooms:update");

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
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Classroom management
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Classrooms
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage learning groups, schedules, and enrolled learners.
          </p>
        </div>
        {createAction}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ClassroomMetric
          icon={Layers3}
          label="Total classrooms"
          value={classroomItems.length}
        />
        <ClassroomMetric
          icon={PlayCircle}
          label="Active classrooms"
          value={activeClassrooms}
        />
        <ClassroomMetric
          icon={UsersRound}
          label="Enrolled learners"
          value={totalLearners}
        />
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
      <div className="mt-4">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          All classrooms
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize and manage your teaching spaces.
        </p>
      </div>
      <ClassroomsTable
        classrooms={classroomItems}
        subjects={subjects.data ?? []}
        isLoading={classrooms.isPending}
        isReloading={classrooms.isFetching && !classrooms.isPending}
        onReload={() => void classrooms.refetch()}
        onOpen={openClassroom}
        onManageStudents={manageStudents}
        onPause={(classroom) =>
          setLifecycleAction({ classroom, action: "pause" })
        }
        onClose={(classroom) =>
          setLifecycleAction({ classroom, action: "close" })
        }
        canUpdate={canUpdate}
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
      <AlertDialog
        open={Boolean(lifecycleAction)}
        onOpenChange={(open) => !open && setLifecycleAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lifecycleAction?.action === "close"
                ? "Close classroom?"
                : "Pause classroom?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lifecycleAction?.action === "close"
                ? `“${lifecycleAction.classroom.name}” will be closed and cannot accept normal teaching activity.`
                : `“${lifecycleAction?.classroom.name}” will be paused until you reopen it from its classroom settings.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={
                lifecycleAction?.action === "close" ? "destructive" : "default"
              }
              disabled={pauseClassroom.isPending || closeClassroom.isPending}
              onClick={() => {
                if (!lifecycleAction) return;
                const mutation =
                  lifecycleAction.action === "close"
                    ? closeClassroom
                    : pauseClassroom;
                mutation.mutate(lifecycleAction.classroom.id, {
                  onSuccess: () => setLifecycleAction(null),
                });
              }}
            >
              {lifecycleAction?.action === "close"
                ? "Close classroom"
                : "Pause classroom"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function ClassroomMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card className="min-h-28 bg-card/60 py-0 shadow-none">
      <CardContent className="flex h-full items-center gap-5 p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
