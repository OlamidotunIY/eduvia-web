import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { sessionStore } from "@/shared/store";
import type { OrganizationSubjectRecord } from "@/shared/domain";
import {
  useCreateSubjectMutation,
  useOrganizationSubjectsQuery,
  usePlatformSubjectsQuery,
  useUpdateSubjectMutation,
} from "../../application";
import { SubjectDialog } from "../components/subject-dialog";
import { SubjectsTable } from "../components/subjects-table";

export function SubjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] =
    useState<OrganizationSubjectRecord | null>(null);
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const canRead = permissions.includes("subjects:read");
  const canCreate = permissions.includes("subjects:create");
  const canUpdate = permissions.includes("subjects:update");
  const subjects = useOrganizationSubjectsQuery(organizationId);
  const platformSubjects = usePlatformSubjectsQuery(canRead);
  const createSubject = useCreateSubjectMutation(organizationId);
  const updateSubject = useUpdateSubjectMutation(organizationId);

  const openCreate = () => {
    setEditingSubject(null);
    setIsDialogOpen(true);
  };
  const openEdit = (subject: OrganizationSubjectRecord) => {
    setEditingSubject(subject);
    setIsDialogOpen(true);
  };
  const createAction = useMemo(
    () =>
      canCreate ? (
        <Button onClick={openCreate}>
          <Plus />
          Add subject
        </Button>
      ) : undefined,
    [canCreate],
  );

  if (!organizationId) {
    return <EmptyOrganizationState />;
  }
  if (!canRead) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-start py-16">
        <p className="text-sm font-medium text-primary">Organization</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Subjects are unavailable
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your organization role does not include access to subjects.
        </p>
      </section>
    );
  }

  const saveSubject = (input: {
    name: string;
    platformSubjectId: string | null;
    description: string | null;
  }) => {
    if (editingSubject) {
      updateSubject.mutate(
        { subjectId: editingSubject.id, input },
        { onSuccess: () => setIsDialogOpen(false) },
      );
      return;
    }
    createSubject.mutate(input, { onSuccess: () => setIsDialogOpen(false) });
  };

  const toggleSubject = (subject: OrganizationSubjectRecord) => {
    updateSubject.mutate({
      subjectId: subject.id,
      input: { isActive: !subject.isActive },
    });
  };
  const mutationError =
    (createSubject.error ?? updateSubject.error) instanceof Error
      ? ((createSubject.error ?? updateSubject.error) as Error)
      : null;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Organization</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Subjects
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage the subjects your organization teaches. Link them to the
            Eduvia catalog to keep curriculum options available.
          </p>
        </div>
        {createAction}
      </div>
      {subjects.error || platformSubjects.error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(subjects.error ?? platformSubjects.error) instanceof Error
            ? (subjects.error ?? platformSubjects.error).message
            : "We could not load subjects."}
        </p>
      ) : null}
      <SubjectsTable
        subjects={subjects.data ?? []}
        platformSubjects={platformSubjects.data ?? []}
        isLoading={subjects.isPending}
        isReloading={subjects.isFetching && !subjects.isPending}
        onReload={() => void subjects.refetch()}
        onEdit={openEdit}
        onToggleActive={toggleSubject}
        canUpdate={canUpdate}
        emptyAction={createAction}
      />
      <SubjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        subject={editingSubject}
        platformSubjects={platformSubjects.data ?? []}
        isSubmitting={createSubject.isPending || updateSubject.isPending}
        error={mutationError}
        onSubmit={saveSubject}
      />
    </section>
  );
}

function EmptyOrganizationState() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-start py-16">
      <p className="text-sm font-medium text-primary">Subjects</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold">
        Choose an organization first
      </h1>
      <p className="mt-3 text-muted-foreground">
        Subjects belong to an organization. Select one from the workspace
        switcher, then return here.
      </p>
    </section>
  );
}
