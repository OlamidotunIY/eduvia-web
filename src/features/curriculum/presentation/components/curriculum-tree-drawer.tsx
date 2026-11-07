import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Columns3,
  Compass,
  FileText,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import type {
  CurriculumProfileSummary,
  CurriculumTreeNode,
  OrganizationCurriculumOverview,
} from "@/shared/domain";
import { useCurriculumTreeQuery } from "../../application";
import { CurriculumTreeNav } from "./curriculum-tree-nav";
import { CurriculumNodeInspector } from "./curriculum-node-inspector";
import { CurriculumObjectivesDirectory } from "./curriculum-objectives-directory";
import { CurriculumMatrixView } from "./curriculum-matrix-view";
import { CurriculumPreviewCallout } from "./curriculum-preview-callout";
import { CountryFlag, getCountryName } from "@/shared/ui/country-flag";

interface CurriculumTreeDrawerProps {
  curriculum: CurriculumProfileSummary | null;
  organizationId?: string;
  overview?: OrganizationCurriculumOverview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function findNodeById(
  nodes: CurriculumTreeNode[],
  id: string,
): CurriculumTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children && n.children.length > 0) {
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function CurriculumTreeDrawer({
  curriculum,
  organizationId,
  overview,
  open,
  onOpenChange,
}: CurriculumTreeDrawerProps) {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<CurriculumTreeNode | null>(
    null,
  );
  const [tab, setTab] = useState<"tree" | "objectives" | "matrix">("tree");

  const isPreviewMode = Boolean(
    !overview || overview.offeredSubjects.filter((s) => s.isMapped).length === 0,
  );

  const treeQuery = useCurriculumTreeQuery(
    organizationId,
    curriculum?.id,
    isPreviewMode,
  );
  const treeData = treeQuery.data?.tree ?? [];

  // Default select first meaningful node when tree loads
  useEffect(() => {
    if (treeData.length > 0) {
      if (!selectedNode || !findNodeById(treeData, selectedNode.id)) {
        const first = treeData[0];
        if (first.children && first.children.length > 0) {
          setSelectedNode(first.children[0]);
        } else {
          setSelectedNode(first);
        }
      }
    } else {
      setSelectedNode(null);
    }
  }, [treeData, curriculum?.id]);

  if (!curriculum) return null;

  const countryName = getCountryName(curriculum.countryCode);

  const handlePlanLesson = () => {
    onOpenChange(false);
    navigate(APP_ROUTES.CLASSROOMS);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:sm:max-w-4xl data-[side=right]:lg:max-w-5xl data-[side=right]:w-full overflow-y-auto p-6 flex flex-col gap-6"
      >
        <SheetHeader className="p-0 border-b border-border/70 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between pr-8">
            <div>
              <div className="flex items-center gap-2.5">
                <CountryFlag
                  code={curriculum.countryCode}
                  name={countryName}
                  className="h-4 w-6 rounded-xs"
                />
                <SheetTitle className="text-xl font-bold font-heading text-foreground">
                  {curriculum.name}
                </SheetTitle>
                <Badge
                  variant="secondary"
                  className="font-mono text-xs uppercase"
                >
                  {curriculum.shortCode}
                </Badge>
              </div>

              <SheetDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{countryName}</span>
                <span>•</span>
                <span>Authority: {curriculum.authority}</span>
                {curriculum.version && (
                  <>
                    <span>•</span>
                    <span>Version: {curriculum.version}</span>
                  </>
                )}
                <span>•</span>
                <span className="text-foreground font-medium">
                  {treeQuery.data?.totalNodes ?? 0} total standards & nodes
                </span>
              </SheetDescription>
            </div>

            <Button
              size="sm"
              className="gap-1.5 self-start bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              onClick={handlePlanLesson}
            >
              <Calendar className="size-3.5" />
              <span>Schedule lesson with standard</span>
            </Button>
          </div>
        </SheetHeader>

        {/* Informative Preview Callout */}
        {isPreviewMode && (
          <CurriculumPreviewCallout
            frameworkName={curriculum.name}
            hasOfferedSubjects={Boolean(
              overview && overview.offeredSubjects.length > 0,
            )}
          />
        )}

        {/* Tab switch */}
        <Tabs
          value={tab}
          onValueChange={(val) =>
            setTab(val as "tree" | "objectives" | "matrix")
          }
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="border-b border-border/60 pb-2">
            <TabsList className="bg-muted/60">
              <TabsTrigger value="tree" className="gap-1.5 text-xs">
                <Compass className="size-3.5" />
                <span>Standards Hierarchy</span>
              </TabsTrigger>
              <TabsTrigger value="objectives" className="gap-1.5 text-xs">
                <FileText className="size-3.5" />
                <span>Objectives Directory</span>
              </TabsTrigger>
              <TabsTrigger value="matrix" className="gap-1.5 text-xs">
                <Columns3 className="size-3.5" />
                <span>Subject Alignment</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: Hierarchy Tree + Node Inspector */}
          <TabsContent value="tree" className="pt-4 flex-1 outline-none">
            {treeQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5 space-y-3">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
                <div className="lg:col-span-7 space-y-3">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
              </div>
            ) : treeData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
                <h3 className="font-heading text-base font-semibold text-foreground">
                  No curriculum standards loaded
                </h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  This framework does not have any active curriculum tree nodes
                  registered yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <CurriculumTreeNav
                    nodes={treeData}
                    selectedNodeId={selectedNode?.id ?? null}
                    onSelectNode={setSelectedNode}
                  />
                </div>
                <div className="lg:col-span-7">
                  <CurriculumNodeInspector
                    node={selectedNode}
                    treeNodes={treeData}
                    onSelectNode={setSelectedNode}
                    onNavigateToScheduleLesson={handlePlanLesson}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Objectives Directory */}
          <TabsContent value="objectives" className="pt-4 flex-1 outline-none">
            {treeQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : (
              <CurriculumObjectivesDirectory
                nodes={treeData}
                onNavigateToScheduleLesson={handlePlanLesson}
              />
            )}
          </TabsContent>

          {/* TAB 3: Subject Alignment Matrix */}
          <TabsContent value="matrix" className="pt-4 flex-1 outline-none">
            <CurriculumMatrixView
              offeredSubjects={overview?.offeredSubjects ?? []}
              unmappedSubjects={overview?.unmappedSubjects ?? []}
              activeCurriculum={curriculum}
              onExploreSubject={(subj) => {
                setTab("tree");
                const found = treeData.find(
                  (n) =>
                    n.name.toLowerCase().includes(subj.toLowerCase()) ||
                    (n.children &&
                      n.children.some((c) =>
                        c.name.toLowerCase().includes(subj.toLowerCase()),
                      )),
                );
                if (found) {
                  const match =
                    found.name.toLowerCase().includes(subj.toLowerCase())
                      ? found
                      : found.children?.find((c) =>
                          c.name.toLowerCase().includes(subj.toLowerCase()),
                        );
                  if (match) setSelectedNode(match);
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
