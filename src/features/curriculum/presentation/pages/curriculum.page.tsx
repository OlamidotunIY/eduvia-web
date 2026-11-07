import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ShieldAlert } from "lucide-react";
import { useMainHeaderSlot } from "@/app/shell/main/header";
import { curriculumDetailRoute } from "@/shared/constant/routes.constants";
import type { CurriculumProfileSummary, CurriculumSearchResult } from "@/shared/domain";
import { sessionStore } from "@/shared/store";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { useCurriculumOverviewQuery } from "../../application";
import { CurriculaTable } from "../components/curricula-table";
import { CurriculumMainHeader } from "../components/curriculum-main-header";
import { CurriculumMetrics } from "../components/curriculum-metrics";
import { CurriculumSearchDialog } from "../components/curriculum-search-dialog";

export function CurriculumPage() {
  const navigate = useNavigate();
  const { element: headerSlot } = useMainHeaderSlot();
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const canRead = permissions.includes("curriculum:read");
  const [searchOpen, setSearchOpen] = useState(false);
  const overviewQuery = useCurriculumOverviewQuery(organizationId);

  const curricula = overviewQuery.data?.curricula ?? [];
  const activeCurricula = useMemo(
    () => curricula.filter((curriculum) => curriculum.isActive).length,
    [curricula],
  );
  const countriesRepresented = useMemo(
    () => new Set(curricula.map((curriculum) => curriculum.countryCode)).size,
    [curricula],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (event.target as HTMLElement)?.tagName,
        )
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openCurriculum = (curriculum: CurriculumProfileSummary) => {
    navigate(curriculumDetailRoute(curriculum.id));
  };

  const selectSearchResult = (result: CurriculumSearchResult) => {
    navigate(curriculumDetailRoute(result.curriculumId));
  };

  if (!organizationId) {
    return (
      <Empty className="py-20">
        <EmptyMedia variant="icon">
          <BookOpen className="size-6 text-muted-foreground" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No active organization</EmptyTitle>
          <EmptyDescription>
            Select an organization to view the curriculum standards relevant to its learners.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!canRead) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-bold">Curriculum access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your organization role does not include curriculum access.
        </p>
      </section>
    );
  }

  return (
    <>
      <CurriculumMainHeader
        headerSlot={headerSlot}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <div className="space-y-8 pb-12">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Curriculum</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Standards selected from your organization’s active subjects, learner grades, and jurisdictions.
          </p>
          {overviewQuery.data && (
            <p className="mt-2 text-xs text-muted-foreground">
              {overviewQuery.data.learnerGrades.length > 0
                ? `Learner grades: ${overviewQuery.data.learnerGrades.join(", ")}`
                : "Add enrolled learners with grade information to narrow the available courses."}
            </p>
          )}
        </div>

        <CurriculumMetrics
          totalCurricula={curricula.length}
          activeCurricula={activeCurricula}
          countriesRepresented={countriesRepresented}
          isLoading={overviewQuery.isLoading}
        />

        <CurriculaTable
          curricula={curricula}
          isLoading={overviewQuery.isLoading}
          isRefreshing={overviewQuery.isRefetching}
          onRefresh={() => overviewQuery.refetch()}
          onViewCurriculum={openCurriculum}
        />
      </div>

      <CurriculumSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        organizationId={organizationId}
        onSelectResult={selectSearchResult}
      />
    </>
  );
}
