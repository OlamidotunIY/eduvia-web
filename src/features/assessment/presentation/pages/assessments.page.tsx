import { createPortal } from "react-dom";
import { ClipboardCheck, CircleCheckBig, Clock3, ListChecks } from "lucide-react";
import { useMainHeaderSlot } from "@/app/shell/main/header";
import { sessionStore } from "@/shared/store";
import { useAssessmentsQuery, useAssessmentSummaryQuery } from "../../application";
import { AssessmentsTable } from "../components/assessments-table";

export function AssessmentsPage() {
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const { element: headerSlot } = useMainHeaderSlot();
  const canRead = permissions.includes("assessments:read");
  const assessments = useAssessmentsQuery(organizationId, undefined);
  const summary = useAssessmentSummaryQuery(organizationId, undefined);

  if (!organizationId) return <EmptyOrganizationState />;
  if (!canRead) return <UnavailableState />;

  return (
    <>
      {headerSlot
        ? createPortal(
            <div className="flex min-w-0 items-center gap-2">
              <ClipboardCheck className="size-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-semibold">Assessments</span>
              {summary.data?.pendingMarking ? (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {summary.data.pendingMarking} pending
                </span>
              ) : null}
            </div>,
            headerSlot,
          )
        : null}
      <section className="flex min-h-0 flex-1 flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-primary">Teaching workspace</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Assessments</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review submitted work, prioritise marking, and see learner outcomes from classroom and assignment activity.
          </p>
        </div>
        {assessments.error || summary.error ? (
          <p className="border-l-2 border-destructive px-3 py-2 text-sm text-destructive">
            {(assessments.error ?? summary.error) instanceof Error
              ? (assessments.error ?? summary.error).message
              : "We could not load assessments."}
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total assessments" value={summary.data?.total} icon={ListChecks} description="Recorded learner outcomes" />
          <Metric label="Awaiting marking" value={summary.data?.pendingMarking} icon={Clock3} description="Responses needing review" emphasis="amber" />
          <Metric label="Fully marked" value={summary.data?.fullyMarked} icon={CircleCheckBig} description="Ready for progress insights" emphasis="emerald" />
          <Metric label="Average score" value={summary.data?.averageScorePercent === null || summary.data?.averageScorePercent === undefined ? "—" : `${Math.round(summary.data.averageScorePercent)}%`} icon={ClipboardCheck} description="Across completed assessments" />
        </div>
        <AssessmentsTable
          assessments={assessments.data?.items ?? []}
          isLoading={assessments.isPending}
          isReloading={assessments.isFetching && !assessments.isPending}
          onReload={() => void assessments.refetch()}
        />
      </section>
    </>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  description,
  emphasis,
}: {
  label: string;
  value: number | string | undefined;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  emphasis?: "amber" | "emerald";
}) {
  const accent = emphasis === "amber" ? "text-amber-700 dark:text-amber-400" : emphasis === "emerald" ? "text-emerald-700 dark:text-emerald-400" : "text-primary";
  return (
    <div className="min-w-0 rounded-xl border bg-gradient-to-b from-background to-muted/20 p-5">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{label}</span><Icon className={`size-4 ${accent}`} />
      </div>
      <p className="mt-3 font-heading text-3xl font-semibold tracking-tight">{value ?? "—"}</p>
      <p className="mt-3 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function EmptyOrganizationState() {
  return <section className="mx-auto flex max-w-xl flex-col items-start py-16"><p className="text-sm font-medium text-primary">Assessments</p><h1 className="mt-2 font-heading text-3xl font-semibold">Choose an organization first</h1><p className="mt-3 text-muted-foreground">Select an organization to view its assessment activity.</p></section>;
}

function UnavailableState() {
  return <section className="mx-auto flex max-w-xl flex-col items-start py-16"><p className="text-sm font-medium text-primary">Assessments</p><h1 className="mt-2 font-heading text-3xl font-semibold">Assessments are unavailable</h1><p className="mt-3 text-muted-foreground">Your organization role does not include access to assessment records.</p></section>;
}
