import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ShieldAlert } from "lucide-react";
import { sessionStore } from "@/shared/store";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/empty";
import { useMainHeaderSlot } from "@/app/shell/main/header";
import { curriculumDetailRoute } from "@/shared/constant/routes.constants";
import type { CurriculumProfileSummary, CurriculumSearchResult } from "@/shared/domain";
import {
  useAllCurriculaQuery,
  useCreateCurriculumMutation,
  useCurriculumOverviewQuery,
  useToggleCurriculumActiveMutation,
} from "../../application";
import { CurriculumMainHeader } from "../components/curriculum-main-header";
import { CurriculumMetrics } from "../components/curriculum-metrics";
import { CurriculaTable } from "../components/curricula-table";
import { CreateCurriculumDialog } from "../components/create-curriculum-dialog";
import { CurriculumSearchDialog } from "../components/curriculum-search-dialog";

export function CurriculumPage() {
  const navigate = useNavigate();
  const { element: headerSlot } = useMainHeaderSlot();
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const canRead = permissions.includes("curriculum:read");

  // State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Queries & Mutations
  const curriculaQuery = useAllCurriculaQuery();
  const overviewQuery = useCurriculumOverviewQuery(organizationId);
  const createCurriculumMutation = useCreateCurriculumMutation();
  const toggleActiveMutation = useToggleCurriculumActiveMutation();

  // Combine curricula data: prefer allCurriculaQuery, fallback to overviewQuery.curricula
  const curriculaList: CurriculumProfileSummary[] = useMemo(() => {
    if (curriculaQuery.data && curriculaQuery.data.length > 0) {
      return curriculaQuery.data;
    }
    if (overviewQuery.data?.curricula && overviewQuery.data.curricula.length > 0) {
      return overviewQuery.data.curricula;
    }
    return [];
  }, [curriculaQuery.data, overviewQuery.data]);

  // Compute metrics
  const totalCurricula = curriculaList.length;
  const activeCurricula = useMemo(
    () => curriculaList.filter((c) => c.isActive).length,
    [curriculaList],
  );
  const countriesRepresented = useMemo(() => {
    const set = new Set<string>();
    for (const c of curriculaList) {
      if (c.countryCode) {
        set.add(c.countryCode.toUpperCase());
      }
    }
    return set.size;
  }, [curriculaList]);

  // Keyboard shortcut: '/' opens search dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement)?.tagName,
        )
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenCurriculum = (curriculum: CurriculumProfileSummary) => {
    navigate(curriculumDetailRoute(curriculum.id));
  };

  const handleToggleActive = (curriculum: CurriculumProfileSummary) => {
    toggleActiveMutation.mutate({
      id: curriculum.id,
      isActive: curriculum.isActive,
    });
  };

  const handleCreateCurriculum = async (input: any) => {
    await createCurriculumMutation.mutateAsync(input);
  };

  const handleSelectSearchResult = (result: CurriculumSearchResult) => {
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
            Please select or join an organization to view its curriculum standards.
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
        <h1 className="mt-4 font-heading text-2xl font-bold">
          Curriculum access restricted
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your current organization role does not include permission to read
          curriculum standards (`curriculum:read`).
        </p>
      </section>
    );
  }

  return (
    <>
      {/* 1. Header Actions (Subjects & Add Curriculum in the application header) */}
      <CurriculumMainHeader
        headerSlot={headerSlot}
        onOpenSearch={() => setSearchOpen(true)}
        onAddCurriculum={() => setCreateDialogOpen(true)}
      />

      {/* 2. Main Page Layout */}
      <div className="space-y-8 pb-12">
        {/* Page Title & Subtitle only - actions are in the header */}
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Curriculum
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage educational frameworks and learning standards across regions.
          </p>
        </div>

        {/* 3 Metric Cards matching reference image */}
        <CurriculumMetrics
          totalCurricula={totalCurricula}
          activeCurricula={activeCurricula}
          countriesRepresented={countriesRepresented}
          isLoading={curriculaQuery.isLoading && !overviewQuery.data}
        />

        {/* Curricula Table with shadcn reusable DataTable */}
        <CurriculaTable
          curricula={curriculaList}
          isLoading={curriculaQuery.isLoading && !overviewQuery.data}
          isRefreshing={curriculaQuery.isRefetching}
          onRefresh={() => {
            curriculaQuery.refetch();
            overviewQuery.refetch();
          }}
          onViewCurriculum={handleOpenCurriculum}
          onToggleActive={handleToggleActive}
        />
      </div>

      {/* Add Curriculum Dialog */}
      <CreateCurriculumDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateCurriculum}
        isSubmitting={createCurriculumMutation.isPending}
      />

      {/* Global Quick Search Dialog */}
      <CurriculumSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        organizationId={organizationId}
        onSelectResult={handleSelectSearchResult}
      />
    </>
  );
}
