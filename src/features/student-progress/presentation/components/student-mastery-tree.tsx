import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  Sparkles,
  Search,
  Edit3,
  BookOpen,
} from "lucide-react";
import { useStudentMasteryGraphQuery } from "../../application";
import type { StudentMasteryNode } from "@/shared/domain";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { TeacherOverrideDialog } from "./teacher-override-dialog";

interface StudentMasteryTreeProps {
  studentId: string;
  orgId?: string;
}

export function StudentMasteryTree({
  studentId,
  orgId,
}: StudentMasteryTreeProps) {
  const { data: nodes, isLoading } = useStudentMasteryGraphQuery(
    studentId,
    orgId,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<StudentMasteryNode | null>(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  const filteredNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.filter((n) => {
      const matchesSearch =
        searchQuery === "" ||
        (n.topicName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.curriculumCode ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.subjectName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.nodeId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || n.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [nodes, searchQuery, statusFilter]);

  const handleOpenOverride = (node: StudentMasteryNode) => {
    setSelectedNode(node);
    setIsOverrideOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls: Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics by name, subject, or code..."
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={statusFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="h-8 text-xs font-medium"
          >
            All ({nodes?.length ?? 0})
          </Button>
          <Button
            variant={statusFilter === "mastered" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("mastered")}
            className="h-8 text-xs font-medium gap-1 text-emerald-500"
          >
            <CheckCircle2 className="size-3" /> Mastered
          </Button>
          <Button
            variant={statusFilter === "in_progress" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("in_progress")}
            className="h-8 text-xs font-medium gap-1 text-blue-500"
          >
            <Clock className="size-3" /> In Progress
          </Button>
          <Button
            variant={statusFilter === "not_started" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("not_started")}
            className="h-8 text-xs font-medium gap-1 text-muted-foreground"
          >
            <CircleDashed className="size-3" /> Not Started
          </Button>
        </div>
      </div>

      {/* Nodes list */}
      {filteredNodes.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="size-8 text-muted-foreground/60 mb-2" />
            <h3 className="text-sm font-semibold text-foreground">
              No curriculum topics found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {nodes?.length === 0
                ? "This learner has not had any curriculum topics evaluated yet."
                : "No curriculum topics matched your search or filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredNodes.map((node) => {
            const score = node.score ?? 0;

            return (
              <Card
                key={node.nodeId}
                className="border-border/60 hover:border-border transition-all bg-card/60"
              >
                <CardContent className="p-4 flex flex-col justify-between gap-3 h-full">
                  {/* Top: Topic Name + Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2">
                        {node.topicName || node.nodeId}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {node.subjectName && (
                          <span className="text-[11px] text-muted-foreground">
                            {node.subjectName}
                          </span>
                        )}
                        {node.curriculumCode && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 font-mono font-normal"
                          >
                            {node.curriculumCode}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={node.status} />
                  </div>

                  {/* Progress bar + Score */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Mastery Level
                      </span>
                      <span className="font-bold text-foreground">
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          score >= 80
                            ? "bg-emerald-500"
                            : score >= 60
                              ? "bg-blue-500"
                              : score >= 40
                                ? "bg-amber-500"
                                : "bg-zinc-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom: Overridden indicator & Override Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <div>
                      {node.overriddenBy ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                          <Sparkles className="size-3" />
                          Manual override applied
                        </span>
                      ) : node.confidenceScore !== undefined ? (
                        <span className="text-[11px] text-muted-foreground">
                          Confidence: {Math.round(node.confidenceScore * 100)}%
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Automated evaluation
                        </span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenOverride(node)}
                      className="h-7 px-2.5 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit3 className="size-3" />
                      Override
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Teacher Override Dialog */}
      {selectedNode && (
        <TeacherOverrideDialog
          open={isOverrideOpen}
          onOpenChange={setIsOverrideOpen}
          node={selectedNode}
          studentId={studentId}
          orgId={orgId ?? ""}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: StudentMasteryNode["status"] }) {
  switch (status) {
    case "mastered":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[11px] px-2 py-0.5 gap-1 shrink-0"
        >
          <CheckCircle2 className="size-3" />
          Mastered
        </Badge>
      );
    case "in_progress":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[11px] px-2 py-0.5 gap-1 shrink-0"
        >
          <Clock className="size-3" />
          In Progress
        </Badge>
      );
    case "not_started":
    default:
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border/60 text-[11px] px-2 py-0.5 gap-1 shrink-0"
        >
          <CircleDashed className="size-3" />
          Not Started
        </Badge>
      );
  }
}
