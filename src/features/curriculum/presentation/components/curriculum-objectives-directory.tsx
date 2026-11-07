import { useMemo, useState } from "react";
import {
  CalendarPlus,
  Check,
  Copy,
  Search,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { CurriculumTreeNode } from "@/shared/domain";

interface CurriculumObjectivesDirectoryProps {
  nodes: CurriculumTreeNode[];
  onNavigateToScheduleLesson?: (objectiveCode: string, name: string) => void;
}

function extractAllLeaves(
  nodes: CurriculumTreeNode[],
  parentBreadcrumb = "",
): Array<CurriculumTreeNode & { breadcrumb: string }> {
  const result: Array<CurriculumTreeNode & { breadcrumb: string }> = [];

  for (const node of nodes) {
    const currentBreadcrumb = parentBreadcrumb
      ? `${parentBreadcrumb} › ${node.name}`
      : node.name;

    if (node.isLeaf) {
      result.push(
        Object.assign(new CurriculumTreeNode(node), {
          breadcrumb: parentBreadcrumb || node.name,
        }),
      );
    } else if (node.children?.length) {
      result.push(...extractAllLeaves(node.children, currentBreadcrumb));
    }
  }

  return result;
}

export function CurriculumObjectivesDirectory({
  nodes,
  onNavigateToScheduleLesson,
}: CurriculumObjectivesDirectoryProps) {
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const allObjectives = useMemo(() => extractAllLeaves(nodes), [nodes]);

  const distinctGrades = useMemo(() => {
    const grades = new Set<string>();
    for (const obj of allObjectives) {
      if (obj.gradeLevel) grades.add(obj.gradeLevel);
    }
    return Array.from(grades);
  }, [allObjectives]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allObjectives.filter((obj) => {
      const matchesSearch =
        !q ||
        obj.name.toLowerCase().includes(q) ||
        (obj.code && obj.code.toLowerCase().includes(q)) ||
        (obj.description && obj.description.toLowerCase().includes(q)) ||
        obj.breadcrumb.toLowerCase().includes(q);

      const matchesGrade =
        selectedGrade === "all" || obj.gradeLevel === selectedGrade;

      return matchesSearch && matchesGrade;
    });
  }, [allObjectives, search, selectedGrade]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter objectives by keyword or standard code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          {distinctGrades.length > 0 && (
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs"
            >
              <option value="all">All Grades/Years</option>
              {distinctGrades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          )}
        </div>

        <span className="text-xs text-muted-foreground shrink-0">
          Showing {filtered.length} of {allObjectives.length} objectives
        </span>
      </div>

      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[140px] text-xs">Standard Code</TableHead>
                  <TableHead className="text-xs">Context / Hierarchy</TableHead>
                  <TableHead className="text-xs">Learning Objective</TableHead>
                  <TableHead className="text-xs">Guidance</TableHead>
                  <TableHead className="w-[100px] text-right text-xs">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-xs text-muted-foreground"
                    >
                      No learning objectives match your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((obj) => (
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
                      <TableCell className="text-xs text-muted-foreground/80 align-top">
                        <span className="line-clamp-1">{obj.breadcrumb}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground align-top">
                        {obj.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground align-top">
                        <span className="line-clamp-2">
                          {obj.description ?? "—"}
                        </span>
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
                              title="Plan lesson"
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
