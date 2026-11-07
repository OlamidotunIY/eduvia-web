import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Layers,
  Search,
  Target,
  X,
} from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CurriculumTreeNode } from "@/shared/domain";

interface CurriculumTreeNavProps {
  nodes: CurriculumTreeNode[];
  selectedNodeId: string | null;
  onSelectNode: (node: CurriculumTreeNode) => void;
}

const nodeTypeIconMap: Record<
  string,
  { icon: typeof BookOpen; color: string; label: string }
> = {
  keystage: {
    icon: GraduationCap,
    color: "text-purple-600 dark:text-purple-400",
    label: "Key Stage",
  },
  subject: {
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    label: "Subject",
  },
  strand: {
    icon: Layers,
    color: "text-emerald-600 dark:text-emerald-400",
    label: "Strand",
  },
  topic: {
    icon: Target,
    color: "text-amber-600 dark:text-amber-400",
    label: "Topic",
  },
  learning_objective: {
    icon: CheckCircle2,
    color: "text-cyan-600 dark:text-cyan-400",
    label: "Objective",
  },
};

function countLeaves(node: CurriculumTreeNode): number {
  if (node.isLeaf) return 1;
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((acc, child) => acc + countLeaves(child), 0);
}

function filterTree(
  nodes: CurriculumTreeNode[],
  search: string,
  selectedKeyStageId: string,
): CurriculumTreeNode[] {
  let filtered = nodes;
  if (selectedKeyStageId !== "all") {
    filtered = nodes.filter((n) => n.id === selectedKeyStageId);
  }

  if (!search) return filtered;
  const q = search.toLowerCase();

  const recurse = (list: CurriculumTreeNode[]): CurriculumTreeNode[] => {
    const result: CurriculumTreeNode[] = [];
    for (const node of list) {
      const matchesSelf =
        node.name.toLowerCase().includes(q) ||
        (node.code && node.code.toLowerCase().includes(q)) ||
        (node.description && node.description.toLowerCase().includes(q));

      const filteredChildren = recurse(node.children ?? []);

      if (matchesSelf || filteredChildren.length > 0) {
        result.push(
          new CurriculumTreeNode({
            ...node,
            children: filteredChildren,
          }),
        );
      }
    }
    return result;
  };

  return recurse(filtered);
}

function collectAllNodeIds(nodes: CurriculumTreeNode[]): string[] {
  const ids: string[] = [];
  for (const n of nodes) {
    ids.push(n.id);
    if (n.children?.length) {
      ids.push(...collectAllNodeIds(n.children));
    }
  }
  return ids;
}

export function CurriculumTreeNav({
  nodes,
  selectedNodeId,
  onSelectNode,
}: CurriculumTreeNavProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedKeyStageId, setSelectedKeyStageId] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const root of nodes) {
      initial.add(root.id);
      for (const child of root.children ?? []) {
        initial.add(child.id);
      }
    }
    return initial;
  });

  // Top key stages for tab filter
  const keyStages = useMemo(
    () => nodes.filter((n) => n.nodeType === "keystage"),
    [nodes],
  );

  const filteredNodes = useMemo(
    () => filterTree(nodes, filterQuery.trim(), selectedKeyStageId),
    [nodes, filterQuery, selectedKeyStageId],
  );

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(collectAllNodeIds(nodes)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const renderNode = (node: CurriculumTreeNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id) || Boolean(filterQuery.trim());
    const isSelected = selectedNodeId === node.id;
    const leafCount = countLeaves(node);

    const iconMeta = nodeTypeIconMap[node.nodeType] ?? {
      icon: BookOpen,
      color: "text-muted-foreground",
      label: node.nodeType,
    };
    const IconComponent = iconMeta.icon;

    return (
      <div key={node.id} className="select-none">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            onSelectNode(node);
            if (hasChildren && !isExpanded) {
              toggleExpand(node.id);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectNode(node);
            }
          }}
          className={cn(
            "group relative flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm transition-all duration-150",
            isSelected
              ? "bg-primary text-primary-foreground font-medium shadow-xs"
              : "text-foreground hover:bg-muted/70",
          )}
          style={{ paddingLeft: `${Math.max(0.5, level * 1.15)}rem` }}
        >
          {isSelected && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-primary-foreground" />
          )}

          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => toggleExpand(node.id, e)}
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded p-0 text-muted-foreground transition-transform hover:bg-accent hover:text-foreground",
                isSelected &&
                  "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20",
              )}
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
          ) : (
            <span className="size-5 shrink-0" />
          )}

          <IconComponent
            className={cn(
              "size-3.5 shrink-0",
              isSelected ? "text-primary-foreground" : iconMeta.color,
            )}
          />

          <span
            className={cn(
              "truncate flex-1 text-xs",
              isSelected ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {node.name}
          </span>

          {node.code && (
            <span
              className={cn(
                "hidden font-mono text-[10px] sm:inline-block opacity-70",
                isSelected ? "text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {node.code}
            </span>
          )}

          {leafCount > 0 && !node.isLeaf && (
            <Badge
              variant={isSelected ? "secondary" : "outline"}
              className={cn(
                "ml-auto text-[10px] h-4 px-1.5 font-normal shrink-0",
                isSelected
                  ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                  : "text-muted-foreground border-border/50",
              )}
            >
              {leafCount}
            </Badge>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-border/40 ml-3.5 mt-0.5 space-y-0.5">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-border/60 bg-card/60 p-3 shadow-xs backdrop-blur-xs">
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Layers className="size-3.5 text-primary" />
          <span>Curriculum Hierarchy</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Expand
          </Button>
          <span className="text-border">|</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Collapse
          </Button>
        </div>
      </div>

      {keyStages.length > 1 && (
        <div className="flex flex-wrap gap-1 pt-1">
          <button
            type="button"
            onClick={() => setSelectedKeyStageId("all")}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition",
              selectedKeyStageId === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:text-foreground",
            )}
          >
            All Stages
          </button>
          {keyStages.map((ks) => (
            <button
              key={ks.id}
              type="button"
              onClick={() => setSelectedKeyStageId(ks.id)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition",
                selectedKeyStageId === ks.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {ks.name}
            </button>
          ))}
        </div>
      )}

      <div className="relative mt-1">
        <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter tree..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="h-8 pl-8 pr-7 text-xs bg-background/60"
        />
        {filterQuery && (
          <button
            type="button"
            onClick={() => setFilterQuery("")}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="mt-1 flex-1 overflow-y-auto space-y-0.5 pr-1 max-h-[calc(100vh-320px)] min-h-[360px]">
        {filteredNodes.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No matching curriculum nodes found.
          </div>
        ) : (
          filteredNodes.map((node) => renderNode(node, 0))
        )}
      </div>
    </div>
  );
}
