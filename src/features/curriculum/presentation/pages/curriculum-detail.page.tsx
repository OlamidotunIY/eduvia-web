import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  Home,
  Landmark,
  Layers,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { sessionStore } from "@/shared/store";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { CountryFlag, getCountryName } from "@/shared/ui/country-flag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import type { CurriculumProfileSummary, CurriculumTreeNode } from "@/shared/domain";
import {
  useAllCurriculaQuery,
  useCreateCurriculumNodeMutation,
  useCurriculumDetailQuery,
  useCurriculumOverviewQuery,
  useCurriculumTreeQuery,
  useToggleCurriculumActiveMutation,
  useUpdateCurriculumMutation,
} from "../../application";
import { CreateCurriculumDialog } from "../components/create-curriculum-dialog";
import { CreateNodeDialog } from "../components/create-node-dialog";

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

function findParentNode(
  nodes: CurriculumTreeNode[],
  childId: string,
  currentParent: CurriculumTreeNode | null = null,
): CurriculumTreeNode | null {
  for (const n of nodes) {
    if (n.id === childId) return currentParent;
    if (n.children && n.children.length > 0) {
      const found = findParentNode(n.children, childId, n);
      if (found) return found;
    }
  }
  return null;
}

function countDescendants(node: CurriculumTreeNode): number {
  if (!node.children || node.children.length === 0) return 0;
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}

function getAllNodeIds(nodes: CurriculumTreeNode[]): string[] {
  const ids: string[] = [];
  function recurse(list: CurriculumTreeNode[]) {
    for (const item of list) {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        recurse(item.children);
      }
    }
  }
  recurse(nodes);
  return ids;
}

function getNodeBreadcrumbs(
  nodes: CurriculumTreeNode[],
  targetId: string,
): CurriculumTreeNode[] {
  const trail: CurriculumTreeNode[] = [];
  function recurse(current: CurriculumTreeNode): boolean {
    trail.push(current);
    if (current.id === targetId) return true;
    if (current.children) {
      for (const child of current.children) {
        if (recurse(child)) return true;
      }
    }
    trail.pop();
    return false;
  }
  for (const root of nodes) {
    if (recurse(root)) return trail;
  }
  return [];
}

function findGradeForNode(
  node: CurriculumTreeNode | null,
  allNodes: CurriculumTreeNode[],
): string {
  if (!node) return "—";
  if (node.gradeLevel) return node.gradeLevel;
  if (node.nodeType === "keystage" || node.nodeType === "grade") return node.name;
  const parent = findParentNode(allNodes, node.id);
  if (parent) {
    if (parent.nodeType === "keystage" || parent.nodeType === "grade") return parent.name;
    if (parent.gradeLevel) return parent.gradeLevel;
    const grandParent = findParentNode(allNodes, parent.id);
    if (grandParent) {
      if (grandParent.nodeType === "keystage" || grandParent.nodeType === "grade") {
        return grandParent.name;
      }
      if (grandParent.gradeLevel) return grandParent.gradeLevel;
    }
  }
  return "—";
}

function nodeOrDescendantMatches(
  node: CurriculumTreeNode,
  filterMatches: (node: CurriculumTreeNode) => boolean,
): boolean {
  if (filterMatches(node)) return true;
  if (node.children && node.children.length > 0) {
    return node.children.some((child) => nodeOrDescendantMatches(child, filterMatches));
  }
  return false;
}

export function CurriculumDetailPage() {
  const { curriculumId } = useParams();
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;

  // State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [copiedCode, setCopiedCode] = useState(false);
  const [editCurriculumOpen, setEditCurriculumOpen] = useState(false);
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [addNodeParent, setAddNodeParent] = useState<CurriculumTreeNode | null>(null);

  // Queries & Mutations
  const detailQuery = useCurriculumDetailQuery(curriculumId);
  const allCurriculaQuery = useAllCurriculaQuery();
  const overviewQuery = useCurriculumOverviewQuery(organizationId);
  const treeQuery = useCurriculumTreeQuery(organizationId, curriculumId, true);
  const toggleActiveMutation = useToggleCurriculumActiveMutation();
  const updateCurriculumMutation = useUpdateCurriculumMutation();
  const createNodeMutation = useCreateCurriculumNodeMutation();

  // Resolve curriculum metadata
  const curriculum: CurriculumProfileSummary | null = useMemo(() => {
    if (detailQuery.data) return detailQuery.data;
    if (allCurriculaQuery.data) {
      const found = allCurriculaQuery.data.find((c) => c.id === curriculumId);
      if (found) return found;
    }
    if (overviewQuery.data?.curricula) {
      const found = overviewQuery.data.curricula.find((c) => c.id === curriculumId);
      if (found) return found;
    }
    return null;
  }, [detailQuery.data, allCurriculaQuery.data, overviewQuery.data, curriculumId]);

  const treeNodes = treeQuery.data?.tree ?? [];

  // Default expand top nodes and select first node
  useEffect(() => {
    if (treeNodes.length > 0) {
      const topIds = treeNodes.map((n) => n.id);
      setExpandedIds((prev) => new Set([...prev, ...topIds]));

      if (!selectedNodeId) {
        const first = treeNodes[0];
        if (first.children && first.children.length > 0) {
          // Find first topic or child if available
          setSelectedNodeId(first.children[0].id);
        } else {
          setSelectedNodeId(first.id);
        }
      }
    }
  }, [treeNodes, selectedNodeId]);

  // Filter tree nodes by search and type
  const filterMatchesNode = (node: CurriculumTreeNode): boolean => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      node.name.toLowerCase().includes(q) ||
      (node.code && node.code.toLowerCase().includes(q));
    const matchesType =
      typeFilter === "ALL" ||
      node.nodeType.toLowerCase() === typeFilter.toLowerCase();
    return Boolean(matchesSearch && matchesType);
  };

  // Auto-expand matching branches when filtering
  useEffect(() => {
    if (!searchQuery && typeFilter === "ALL") return;
    const matchingAncestorIds = new Set<string>();
    function check(n: CurriculumTreeNode): boolean {
      let hasMatch = filterMatchesNode(n);
      if (n.children) {
        for (const child of n.children) {
          if (check(child)) {
            hasMatch = true;
            matchingAncestorIds.add(n.id);
          }
        }
      }
      return hasMatch;
    }
    for (const root of treeNodes) {
      check(root);
    }
    if (matchingAncestorIds.size > 0) {
      setExpandedIds((prev) => new Set([...prev, ...matchingAncestorIds]));
    }
  }, [searchQuery, typeFilter, treeNodes]);

  const selectedNode = useMemo(
    () => (selectedNodeId ? findNodeById(treeNodes, selectedNodeId) : null),
    [treeNodes, selectedNodeId],
  );

  const parentNode = useMemo(
    () => (selectedNodeId ? findParentNode(treeNodes, selectedNodeId) : null),
    [treeNodes, selectedNodeId],
  );

  const breadcrumbs = useMemo(
    () => (selectedNodeId ? getNodeBreadcrumbs(treeNodes, selectedNodeId) : []),
    [treeNodes, selectedNodeId],
  );

  const resolvedGrade = useMemo(
    () => findGradeForNode(selectedNode, treeNodes),
    [selectedNode, treeNodes],
  );

  const countryName = getCountryName(curriculum?.countryCode);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleExpandAll = () => {
    setExpandedIds(new Set(getAllNodeIds(treeNodes)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleCopyCode = (code?: string | null) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleCurriculumActive = () => {
    if (!curriculum) return;
    toggleActiveMutation.mutate({
      id: curriculum.id,
      isActive: curriculum.isActive,
    });
  };

  const handleCreateNodeSubmit = async (data: any) => {
    if (!curriculum) return;
    await createNodeMutation.mutateAsync({
      curriculumId: curriculum.id,
      data,
    });
  };

  if (!curriculum && (detailQuery.isLoading || overviewQuery.isLoading)) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="py-20 text-center">
        <BookOpen className="mx-auto size-12 text-muted-foreground/50" />
        <h2 className="mt-4 font-heading text-xl font-bold">
          Curriculum not found
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The requested educational framework could not be located.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link to={APP_ROUTES.CURRICULUM} />}
          className="mt-4 gap-2"
        >
          <ArrowLeft className="size-4" />
          <span>Back to All curricula</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Back Navigation */}
      <div>
        <Link
          to={APP_ROUTES.CURRICULUM}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>All curricula</span>
        </Link>
      </div>

      {/* 2. Page Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              {curriculum.name}
            </h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium",
                curriculum.isActive
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
              )}
            >
              {curriculum.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {countryName} · {curriculum.authority} · Version{" "}
            {curriculum.version || "2025"}
          </p>
        </div>

        {/* Action Buttons matching design */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditCurriculumOpen(true)}
            className="h-9 gap-1.5 border-border/70 bg-card/60 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Pencil className="size-3.5" />
            <span>Edit curriculum</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setAddNodeParent(null);
              setAddNodeOpen(true);
            }}
            className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium"
          >
            <Plus className="size-3.5" />
            <span>Add node</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-9 border-border/70 bg-card/60 text-muted-foreground hover:text-foreground"
                />
              }
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">More options</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                render={<Link to={APP_ROUTES.SUBJECTS} />}
              >
                <span>Map Organization Subjects</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleToggleCurriculumActive}
                className={cn(
                  curriculum.isActive && "text-destructive focus:text-destructive",
                )}
              >
                {curriculum.isActive
                  ? "Deactivate Curriculum"
                  : "Activate Curriculum"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 3. Four Info Metric Cards matching design */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Authority */}
        <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-border">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/40 text-primary">
            <Landmark className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">
              Authority
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {curriculum.authority}
            </div>
          </div>
        </div>

        {/* Card 2: Code */}
        <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-border">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/40 text-primary">
            <Layers className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">
              Code
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {curriculum.shortCode}
            </div>
          </div>
        </div>

        {/* Card 3: Country */}
        <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-border">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/40">
            <CountryFlag
              code={curriculum.countryCode}
              name={countryName}
              className="h-4 w-6 rounded-xs"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">
              Country
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {countryName}
            </div>
          </div>
        </div>

        {/* Card 4: Status */}
        <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-border">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/40 text-primary">
            <CheckCircle2 className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">
              Status
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {curriculum.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Toolbar above Split View matching design */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search curriculum nodes..."
              className="h-9 w-64 border-border/70 bg-card/60 pl-8 text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Type filter */}
          <Select
            value={typeFilter}
            onValueChange={(val) => setTypeFilter(val ?? "ALL")}
          >
            <SelectTrigger
              size="sm"
              className="h-9 min-w-32 border-border/70 bg-card/60 text-xs font-medium"
            >
              <span className="capitalize">
                {typeFilter === "ALL" ? "All types" : typeFilter.replace("_", " ")}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
              <SelectItem value="keystage">Grade / Key Stage</SelectItem>
              <SelectItem value="strand">Strand</SelectItem>
              <SelectItem value="topic">Topic</SelectItem>
              <SelectItem value="learning_objective">Learning Objective</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expand / Collapse actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
            className="h-9 gap-1.5 border-border/70 bg-card/60 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="size-3.5" />
            <span>Expand all</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            className="h-9 gap-1.5 border-border/70 bg-card/60 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Minimize2 className="size-3.5" />
            <span>Collapse all</span>
          </Button>
        </div>
      </div>

      {/* 5. Main Split View Grid matching design */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Card: Tree Explorer */}
        <div className="lg:col-span-6 rounded-xl border border-border/70 bg-card p-4 min-h-[560px] max-h-[740px] overflow-y-auto">
          {treeQuery.isLoading ? (
            <div className="space-y-3 p-2">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-5/6 rounded-lg ml-4" />
              <Skeleton className="h-8 w-4/6 rounded-lg ml-8" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ) : treeNodes.length === 0 ? (
            <div className="py-20 text-center text-xs text-muted-foreground">
              No curriculum nodes registered under this framework.
            </div>
          ) : (
            <div className="space-y-1">
              {treeNodes.map((node) => (
                <TreeNodeItem
                  key={node.id}
                  node={node}
                  selectedNodeId={selectedNodeId}
                  expandedIds={expandedIds}
                  onSelect={(id) => setSelectedNodeId(id)}
                  onToggleExpand={toggleExpand}
                  filterMatches={filterMatchesNode}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Card: Node Inspector matching design */}
        <div className="lg:col-span-6 rounded-xl border border-border/70 bg-card p-6 flex flex-col justify-between min-h-[560px]">
          {selectedNode ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Node Top Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <FileText className="size-6" />
                    </div>
                    <div>
                      <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                        {selectedNode.name}
                      </h2>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="capitalize text-xs font-normal"
                        >
                          {selectedNode.nodeType === "keystage"
                            ? "Grade"
                            : selectedNode.nodeType.replace("_", " ")}
                        </Badge>
                        <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Code pill badge with copy icon */}
                  {selectedNode.code && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(selectedNode.code)}
                      className="flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-mono text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                      title="Copy standard code"
                    >
                      <span>{selectedNode.code}</span>
                      {copiedCode ? (
                        <Check className="size-3 text-emerald-400" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Breadcrumbs Path */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => {
                      if (treeNodes.length > 0) setSelectedNodeId(treeNodes[0].id);
                    }}
                    className="hover:text-foreground transition-colors"
                  >
                    <Home className="size-3.5 shrink-0 text-muted-foreground/70 hover:text-foreground" />
                  </button>
                  {breadcrumbs.map((seg, idx) => (
                    <span key={seg.id} className="flex items-center gap-1.5">
                      <span className="text-muted-foreground/40">›</span>
                      <button
                        type="button"
                        onClick={() => setSelectedNodeId(seg.id)}
                        className={cn(
                          "transition-colors hover:underline",
                          idx === breadcrumbs.length - 1
                            ? "font-semibold text-foreground cursor-default hover:no-underline"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {seg.name}
                      </button>
                    </span>
                  ))}
                </div>

                {/* Divider line */}
                <div className="my-5 border-t border-border/70" />

                {/* 2-Column Metadata block matching design */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Layers className="size-5 text-muted-foreground/70 shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Grade</div>
                      <div className="text-sm font-semibold text-foreground">
                        {resolvedGrade}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-l border-border/70 pl-4">
                    <GitBranch className="size-5 text-muted-foreground/70 shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Parent</div>
                      <div className="text-sm font-semibold text-foreground truncate">
                        {parentNode?.name || "Root"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider line */}
                <div className="my-5 border-t border-border/70" />

                {/* Description section */}
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Description
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {selectedNode.description ||
                      "Develops learners' ability to solve problems, represent concepts systematically, and apply curriculum standards to real-world scenarios."}
                  </p>
                </div>
              </div>

              {/* Bottom Action buttons matching design */}
              <div className="mt-8 flex items-center gap-2.5 border-t border-border/70 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAddNodeParent(parentNode);
                    setAddNodeOpen(true);
                  }}
                  className="h-9 gap-1.5 border-border/70 bg-card/60 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit node</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAddNodeParent(selectedNode);
                    setAddNodeOpen(true);
                  }}
                  className="h-9 gap-1.5 border-primary/50 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  <Plus className="size-3.5" />
                  <span>Add child</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {}}
                  className="h-9 gap-1.5 border-destructive/40 text-xs font-medium text-destructive hover:bg-destructive/10 ml-auto"
                >
                  <Power className="size-3.5" />
                  <span>Deactivate</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <BookOpen className="size-10 text-muted-foreground/40 mb-2" />
              <h3 className="font-heading text-sm font-semibold text-foreground">
                No node selected
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Select a subject, grade, strand, or topic from the tree to view its details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Curriculum Dialog */}
      <CreateCurriculumDialog
        open={editCurriculumOpen}
        onOpenChange={setEditCurriculumOpen}
        onSubmit={async (data) => {
          if (!curriculum) return;
          await updateCurriculumMutation.mutateAsync({
            id: curriculum.id,
            data,
          });
          setEditCurriculumOpen(false);
        }}
      />

      {/* Add / Child Node Dialog */}
      <CreateNodeDialog
        open={addNodeOpen}
        onOpenChange={setAddNodeOpen}
        curriculumId={curriculum.id}
        parentNode={addNodeParent}
        onSubmit={handleCreateNodeSubmit}
        isSubmitting={createNodeMutation.isPending}
      />
    </div>
  );
}

interface TreeNodeItemProps {
  node: CurriculumTreeNode;
  selectedNodeId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string, e: React.MouseEvent) => void;
  filterMatches: (node: CurriculumTreeNode) => boolean;
  depth: number;
}

function TreeNodeItem({
  node,
  selectedNodeId,
  expandedIds,
  onSelect,
  onToggleExpand,
  filterMatches,
  depth,
}: TreeNodeItemProps) {
  if (!nodeOrDescendantMatches(node, filterMatches)) {
    return null;
  }

  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const childCount = countDescendants(node);

  const isFolder = ["subject", "keystage", "grade", "strand"].includes(
    node.nodeType.toLowerCase(),
  );

  return (
    <div className="select-none">
      <div
        onClick={() => onSelect(node.id)}
        className={cn(
          "group flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer",
          isSelected
            ? "border border-emerald-500/50 bg-emerald-500/10 text-foreground"
            : "hover:bg-muted/40 text-muted-foreground hover:text-foreground",
        )}
        style={{ paddingLeft: `${Math.max(10, depth * 20)}px` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {/* Chevron expand trigger */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => onToggleExpand(node.id, e)}
              className="grid size-4 place-items-center rounded hover:bg-muted"
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="size-4 shrink-0" />
          )}

          {/* Node icon */}
          {isFolder ? (
            isExpanded ? (
              <FolderOpen className="size-4 text-cyan-400 shrink-0" />
            ) : (
              <Folder className="size-4 text-cyan-400 shrink-0" />
            )
          ) : (
            <FileText className="size-4 text-emerald-400 shrink-0" />
          )}

          {/* Node name */}
          <span
            className={cn(
              "truncate font-medium",
              isSelected ? "text-foreground font-semibold" : "text-foreground/90",
            )}
          >
            {node.name}
          </span>

          {/* Node type badge */}
          <span className="rounded bg-muted/60 px-1.5 py-0.2 text-[10px] font-normal capitalize text-muted-foreground">
            {node.nodeType === "keystage" ? "Grade" : node.nodeType.replace("_", " ")}
          </span>
        </div>

        {/* Count badge on the far right */}
        {childCount > 0 && (
          <span className="text-[11px] font-medium text-muted-foreground shrink-0">
            {childCount}
          </span>
        )}
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="relative border-l border-border/40 ml-4 pl-1">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              filterMatches={filterMatches}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
