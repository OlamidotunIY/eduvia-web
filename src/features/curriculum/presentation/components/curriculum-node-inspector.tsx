import { useState } from "react";
import {
  BookOpen,
  CalendarPlus,
  Check,
  ChevronRight,
  Copy,
  FolderTree,
  Hash,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import type { CurriculumTreeNode } from "@/shared/domain";

interface CurriculumNodeInspectorProps {
  node: CurriculumTreeNode | null;
  treeNodes: CurriculumTreeNode[];
  onSelectNode: (node: CurriculumTreeNode) => void;
  onNavigateToScheduleLesson?: (objectiveCode: string, name: string) => void;
}

const nodeTypeBadges: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  keystage: { label: "Key Stage", variant: "default" },
  subject: { label: "Subject", variant: "secondary" },
  strand: { label: "Strand", variant: "outline" },
  topic: { label: "Topic", variant: "outline" },
  learning_objective: { label: "Learning Objective", variant: "secondary" },
};

function collectObjectiveLeaves(node: CurriculumTreeNode): CurriculumTreeNode[] {
  if (node.isLeaf) return [node];
  const leaves: CurriculumTreeNode[] = [];
  for (const child of node.children ?? []) {
    leaves.push(...collectObjectiveLeaves(child));
  }
  return leaves;
}

function findBreadcrumbs(
  nodes: CurriculumTreeNode[],
  targetId: string,
  trail: CurriculumTreeNode[] = [],
): CurriculumTreeNode[] | null {
  for (const n of nodes) {
    const current = [...trail, n];
    if (n.id === targetId) return current;
    if (n.children?.length) {
      const found = findBreadcrumbs(n.children, targetId, current);
      if (found) return found;
    }
  }
  return null;
}

export function CurriculumNodeInspector({
  node,
  treeNodes,
  onSelectNode,
  onNavigateToScheduleLesson,
}: CurriculumNodeInspectorProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!node) {
    return (
      <Card className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-xl border-dashed border-border/70 bg-card/40 p-8 text-center text-muted-foreground backdrop-blur-xs">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
          <FolderTree className="size-6 text-muted-foreground/60" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-foreground">
          No curriculum node selected
        </h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Select any Key Stage, Subject, Strand, or Topic from the curriculum hierarchy to inspect its standards and learning objectives.
        </p>
      </Card>
    );
  }

  const breadcrumbs = findBreadcrumbs(treeNodes, node.id) ?? [node];

  const badgeInfo = nodeTypeBadges[node.nodeType] ?? {
    label: node.nodeType,
    variant: "outline" as const,
  };

  const hasDirectLeaves =
    node.children && node.children.some((child) => child.isLeaf);
  const directLeaves = hasDirectLeaves
    ? node.children.filter((c) => c.isLeaf)
    : [];
  const nonLeafChildren =
    node.children && node.children.some((child) => !child.isLeaf)
      ? node.children.filter((c) => !c.isLeaf)
      : [];

  const allSubLeaves = !hasDirectLeaves ? collectObjectiveLeaves(node) : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb Path Bar */}
      {breadcrumbs.length > 1 && (
        <nav aria-label="Curriculum Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={crumb.id} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />}
                {isLast ? (
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {crumb.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectNode(crumb)}
                    className="hover:text-primary transition underline-offset-2 hover:underline truncate max-w-[150px]"
                  >
                    {crumb.name}
                  </button>
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Node Header Card */}
      <Card className="rounded-xl border-border/60 bg-gradient-to-b from-card to-card/60 shadow-xs backdrop-blur-xs">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={badgeInfo.variant} className="capitalize text-xs">
                {badgeInfo.label}
              </Badge>
              {node.gradeLevel && (
                <Badge variant="outline" className="text-xs bg-muted/40 font-normal">
                  {node.gradeLevel}
                </Badge>
              )}
              {node.code && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(node.code!)}
                  className="inline-flex items-center gap-1 rounded bg-muted/80 px-2.5 py-0.5 font-mono text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  title="Click to copy standard code"
                >
                  <Hash className="size-3 text-primary" />
                  <span>{node.code}</span>
                  {copiedCode === node.code ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              )}
            </div>

            {node.code && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(node.code!)}
                className="h-8 gap-1.5 text-xs bg-background/60"
              >
                {copiedCode === node.code ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy Code
                  </>
                )}
              </Button>
            )}
          </div>

          <h2 className="mt-3 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {node.name}
          </h2>

          {node.description ? (
            <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-3.5 text-sm leading-relaxed text-muted-foreground">
              {node.description}
            </div>
          ) : (
            <p className="mt-2 text-xs italic text-muted-foreground/60">
              No additional pedagogical description specified for this standard.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sub-structures Grid (if KeyStage, Subject, or parent Strand) */}
      {nonLeafChildren.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {node.nodeType === "keystage"
                ? "Academic Subjects"
                : node.nodeType === "subject"
                  ? "Curriculum Strands"
                  : "Topics & Sub-sections"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {nonLeafChildren.length}{" "}
              {nonLeafChildren.length === 1 ? "section" : "sections"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nonLeafChildren.map((child) => {
              const childLeaves = collectObjectiveLeaves(child);
              return (
                <div
                  key={child.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectNode(child)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectNode(child);
                    }
                  }}
                  className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:border-primary/50 hover:bg-card hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground group-hover:text-primary">
                        {child.code ?? child.nodeType}
                      </span>
                      {childLeaves.length > 0 && (
                        <Badge variant="outline" className="text-[10px] h-4 bg-background">
                          {childLeaves.length} obj
                        </Badge>
                      )}
                    </div>
                    <h4 className="mt-1.5 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {child.name}
                    </h4>
                    {child.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {child.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-3.5 flex items-center justify-end text-xs font-medium text-primary">
                    <span className="group-hover:underline">Explore</span>
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct Learning Objectives Table (when viewing a Topic) */}
      {directLeaves.length > 0 && (
        <Card className="rounded-xl border-border/60 shadow-xs bg-card/60">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  Learning Objectives ({directLeaves.length})
                </CardTitle>
              </div>
              <span className="text-xs text-muted-foreground">
                Official curriculum outcomes & assessment goals
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] text-xs">Standard Code</TableHead>
                  <TableHead className="text-xs">Objective Statement</TableHead>
                  <TableHead className="text-xs">Pedagogical Guidance</TableHead>
                  <TableHead className="w-[130px] text-right text-xs">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directLeaves.map((obj) => (
                  <TableRow key={obj.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs font-semibold text-primary align-top">
                      <div className="flex items-center gap-1">
                        <span>{obj.code ?? "—"}</span>
                        {obj.code && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(obj.code!)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Copy code"
                          >
                            {copiedCode === obj.code ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground align-top">
                      {obj.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground align-top">
                      {obj.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        {obj.code && onNavigateToScheduleLesson && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onNavigateToScheduleLesson(obj.code!, obj.name)
                            }
                            className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                            title="Plan classroom lesson for this objective"
                          >
                            <CalendarPlus className="size-3" />
                            Plan
                          </Button>
                        )}
                        {obj.code && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(obj.code!)}
                            className="h-7 px-1.5 text-muted-foreground hover:text-foreground"
                            title="Copy code"
                          >
                            {copiedCode === obj.code ? (
                              <Check className="size-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Aggregate Objectives Table when viewing high-level KeyStage or Subject with no direct leaves */}
      {!hasDirectLeaves && allSubLeaves.length > 0 && nonLeafChildren.length > 0 && (
        <Card className="rounded-xl border-border/60 shadow-xs bg-card/60">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  All Underlying Objectives ({allSubLeaves.length})
                </CardTitle>
              </div>
              <span className="text-xs text-muted-foreground">
                Click any topic card above to drill down directly
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[360px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px] text-xs">Code</TableHead>
                    <TableHead className="text-xs">Objective</TableHead>
                    <TableHead className="text-xs">Guidance</TableHead>
                    <TableHead className="w-[80px] text-right text-xs">
                      Copy
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allSubLeaves.slice(0, 25).map((obj) => (
                    <TableRow key={obj.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs text-primary align-top">
                        {obj.code ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground align-top">
                        {obj.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground align-top">
                        {obj.description ?? "—"}
                      </TableCell>
                      <TableCell className="text-right align-top">
                        {obj.code && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(obj.code!)}
                            className="h-6 px-1.5 text-muted-foreground hover:text-foreground"
                          >
                            {copiedCode === obj.code ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {allSubLeaves.length > 25 && (
              <div className="border-t border-border/60 p-2 text-center text-xs text-muted-foreground">
                Showing 25 of {allSubLeaves.length} objectives. Select a specific topic to view its dedicated set.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
