import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Filter,
  Globe,
  Landmark,
  Layers,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Tag,
  Trash2,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { questionRoute } from "@/shared/constant/routes.constants";
import { sessionStore } from "@/shared/store";
import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  usePublishQuestionMutation,
  useQuestionsQuery,
  useQuestionSummaryQuery,
  useUnpublishQuestionMutation,
} from "../../application";
import type {
  QuestionFilter,
  QuestionRecord,
  QuestionType,
} from "@/shared/domain";
import { CreateQuestionDialog } from "../components/create-question-dialog";
import { ViewQuestionDialog } from "../components/view-question-dialog";

type ScopeTab = "all" | "platform" | "org";

export function QuestionsPage() {
  const navigate = useNavigate();
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];

  const canCreate = permissions.includes("questions:create");
  const canPublish = permissions.includes("questions:publish");
  const canDelete = permissions.includes("questions:delete");

  // Tab & Filters state
  const [scopeTab, setScopeTab] = useState<ScopeTab>("all");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<QuestionRecord | null>(
    null,
  );

  // Queries
  const filterParams: QuestionFilter = useMemo(() => {
    const f: QuestionFilter = {
      skip: page * pageSize,
      take: pageSize,
    };
    if (scopeTab === "platform") f.ownerType = "platform";
    if (scopeTab === "org") f.ownerType = "org";
    if (search.trim()) f.search = search.trim();
    if (subjectFilter !== "all") f.subject = subjectFilter;
    if (typeFilter !== "all") f.type = typeFilter as QuestionType;
    if (difficultyFilter !== "all") f.difficultyLevel = Number(difficultyFilter);
    if (statusFilter !== "all") f.isPublished = statusFilter === "published";
    return f;
  }, [scopeTab, search, subjectFilter, typeFilter, difficultyFilter, statusFilter, page]);

  const questionsQuery = useQuestionsQuery(organizationId, filterParams);
  const summaryQuery = useQuestionSummaryQuery(organizationId);

  // Mutations
  const createMutation = useCreateQuestionMutation(organizationId);
  const publishMutation = usePublishQuestionMutation(organizationId);
  const unpublishMutation = useUnpublishQuestionMutation(organizationId);
  const deleteMutation = useDeleteQuestionMutation(organizationId);

  const summary = summaryQuery.data ?? {
    totalAccessible: 0,
    platformQuestions: 0,
    orgQuestions: 0,
    publishedOrgQuestions: 0,
  };

  const items = Array.isArray(questionsQuery.data)
    ? questionsQuery.data
    : (questionsQuery.data as { items?: QuestionRecord[] } | undefined)?.items ?? [];
  const totalItems = Array.isArray(questionsQuery.data)
    ? questionsQuery.data.length
    : (questionsQuery.data as { total?: number } | undefined)?.total ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages - 1);

  // Derived subjects list for filter
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => set.add(item.subject));
    return Array.from(set);
  }, [items]);

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">
            Question bank
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse platform questions and manage your organization&apos;s question
            library.
          </p>
        </div>
        <Button
          className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold"
          disabled={!canCreate}
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="size-4" /> Create question
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card/60 py-0 shadow-none">
          <CardContent className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available questions</p>
              <p className="font-sans text-2xl font-bold text-foreground">
                {summaryQuery.isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  summary.totalAccessible
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 py-0 shadow-none">
          <CardContent className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Landmark className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Organization questions</p>
              <p className="font-sans text-2xl font-bold text-foreground">
                {summaryQuery.isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  summary.orgQuestions
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 py-0 shadow-none">
          <CardContent className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Published in your organization
              </p>
              <p className="font-sans text-2xl font-bold text-foreground">
                {summaryQuery.isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  summary.publishedOrgQuestions
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scope Tabs */}
      <Tabs
        value={scopeTab}
        onValueChange={(val) => {
          setScopeTab(val as ScopeTab);
          setPage(0);
        }}
        className="gap-4"
      >
        <TabsList
          variant="line"
          aria-label="Question Bank Libraries"
          className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent p-0 pb-2"
        >
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="all"
          >
            <LayoutGrid className="size-3.5" /> All accessible (
            {summary.totalAccessible})
          </TabsTrigger>
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="platform"
          >
            <Globe className="size-3.5" /> Platform library (
            {summary.platformQuestions})
          </TabsTrigger>
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="org"
          >
            <Landmark className="size-3.5" /> Organization library (
            {summary.orgQuestions})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-lg px-3 text-xs"
          >
            <Filter className="size-3.5 text-muted-foreground" />
            <span>Filter</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>

          <div className="relative w-64 max-w-xs">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-lg pl-8 text-xs"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>

          <Select
            value={subjectFilter}
            onValueChange={(val) => {
              setSubjectFilter(val ?? "all");
              setPage(0);
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-9 min-w-32 rounded-lg text-xs [&_svg:last-child]:hidden"
            >
              <span className="flex flex-1 items-center gap-1.5 text-left">
                <BookOpen className="size-3.5 text-muted-foreground" />
                <span>
                  {subjectFilter === "all" ? "Subject" : subjectFilter}
                </span>
              </span>
              <ChevronDown className="ml-1.5 size-3.5 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Subject</SelectItem>
              {availableSubjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val ?? "all");
              setPage(0);
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-9 min-w-28 rounded-lg text-xs [&_svg:last-child]:hidden"
            >
              <span className="flex flex-1 items-center gap-1.5 text-left">
                <Tag className="size-3.5 text-muted-foreground" />
                <span>
                  {typeFilter === "all"
                    ? "Type"
                    : typeFilter === "mcq"
                      ? "Multiple choice"
                      : typeFilter === "short_answer"
                        ? "Short answer"
                        : "Long answer"}
                </span>
              </span>
              <ChevronDown className="ml-1.5 size-3.5 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Type</SelectItem>
              <SelectItem value="mcq">Multiple choice</SelectItem>
              <SelectItem value="short_answer">Short answer</SelectItem>
              <SelectItem value="long_answer">Long answer</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={difficultyFilter}
            onValueChange={(val) => {
              setDifficultyFilter(val ?? "all");
              setPage(0);
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-9 min-w-32 rounded-lg text-xs [&_svg:last-child]:hidden"
            >
              <span className="flex flex-1 items-center gap-1.5 text-left">
                <BarChart3 className="size-3.5 text-muted-foreground" />
                <span>
                  {difficultyFilter === "all"
                    ? "Difficulty"
                    : `${difficultyFilter} / 5`}
                </span>
              </span>
              <ChevronDown className="ml-1.5 size-3.5 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Difficulty</SelectItem>
              <SelectItem value="1">1 / 5</SelectItem>
              <SelectItem value="2">2 / 5</SelectItem>
              <SelectItem value="3">3 / 5</SelectItem>
              <SelectItem value="4">4 / 5</SelectItem>
              <SelectItem value="5">5 / 5</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val ?? "all");
              setPage(0);
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-9 min-w-28 rounded-lg text-xs [&_svg:last-child]:hidden"
            >
              <span className="flex flex-1 items-center gap-1.5 text-left">
                <Settings className="size-3.5 text-muted-foreground" />
                <span>
                  {statusFilter === "all"
                    ? "Status"
                    : statusFilter === "published"
                      ? "Published"
                      : "Draft"}
                </span>
              </span>
              <ChevronDown className="ml-1.5 size-3.5 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-lg"
          disabled={questionsQuery.isFetching}
          onClick={() => {
            void questionsQuery.refetch();
            void summaryQuery.refetch();
          }}
          title="Refresh question bank"
        >
          <RefreshCw
            className={
              questionsQuery.isFetching ? "size-4 animate-spin" : "size-4"
            }
          />
        </Button>
      </div>

      {/* Question Table */}
      <div className="border-b border-border/80">
        <Table>
          <TableHeader className="[&_th]:px-4 [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg [&_tr]:border-0 [&_tr]:bg-muted/50 [&_tr]:hover:bg-muted/50">
            <TableRow className="hover:bg-muted/50">
              <TableHead>Question</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:px-4 [&_td]:py-3.5 [&_tr]:hover:bg-transparent">
            {questionsQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell>
                    <Skeleton className="h-4 w-56" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-7 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length ? (
              items.map((q) => {
                const isPlatform = q.ownerType === "platform";
                return (
                  <TableRow key={q.id} className="hover:bg-transparent">
                    <TableCell
                      className="max-w-md cursor-pointer"
                      onClick={() => navigate(questionRoute(q.id))}
                    >
                      <p className="truncate text-xs font-semibold text-foreground transition-colors hover:text-primary">
                        {q.stem}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isPlatform
                            ? "rounded-full border-muted-foreground/30 bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                            : "rounded-full border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                        }
                      >
                        {isPlatform ? "Platform" : "Organization"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-foreground">
                      {q.subject}
                    </TableCell>

                    <TableCell className="text-xs text-foreground">
                      {q.type === "mcq"
                        ? "Multiple choice"
                        : q.type === "short_answer"
                          ? "Short answer"
                          : "Long answer"}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {q.difficultyLevel} / 5
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          q.isPublished
                            ? "rounded-full border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
                            : "rounded-full border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                        }
                      >
                        {q.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="View question details"
                          onClick={() => navigate(questionRoute(q.id))}
                        >
                          <Eye className="size-4" />
                        </Button>

                        {!isPlatform ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="size-7 text-muted-foreground hover:text-foreground"
                              title="Edit question"
                              onClick={() => navigate(questionRoute(q.id))}
                            >
                              <Pencil className="size-3.5" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="size-7 text-muted-foreground hover:text-foreground"
                                    aria-label="Question actions"
                                  />
                                }
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                {q.isPublished ? (
                                  <DropdownMenuItem
                                    disabled={
                                      !canPublish ||
                                      unpublishMutation.isPending
                                    }
                                    onClick={() =>
                                      unpublishMutation.mutate(q.id)
                                    }
                                  >
                                    Unpublish
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    disabled={
                                      !canPublish || publishMutation.isPending
                                    }
                                    onClick={() =>
                                      publishMutation.mutate(q.id)
                                    }
                                  >
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  disabled={
                                    !canDelete ||
                                    q.usageCount > 0 ||
                                    deleteMutation.isPending
                                  }
                                  onClick={() => deleteMutation.mutate(q.id)}
                                >
                                  <Trash2 className="size-3.5" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7}>
                  <Empty className="min-h-40 flex-none border-0 bg-transparent px-4 py-8">
                    <EmptyHeader className="gap-1">
                      <EmptyMedia variant="icon" className="mb-1 size-9">
                        <Layers className="size-4" />
                      </EmptyMedia>
                      <EmptyTitle className="text-base">
                        No questions found
                      </EmptyTitle>
                      <EmptyDescription className="max-w-xs text-xs">
                        Questions matching your selected filter or library will
                        appear here.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 pt-1 text-xs">
        <span className="flex-1 text-muted-foreground">
          {totalItems} total items
        </span>
        <div className="flex items-center gap-4">
          <span className="font-medium">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setPage(0)}
              disabled={currentPage === 0}
              aria-label="First page"
            >
              <ChevronsLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() =>
                setPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage >= totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              aria-label="Last page"
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <CreateQuestionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        subjects={availableSubjects.map((s) => ({ id: s, name: s }))}
        isSubmitting={createMutation.isPending}
        onSubmit={(input) => {
          createMutation.mutate(input, {
            onSuccess: () => setIsCreateOpen(false),
          });
        }}
      />

      {/* View Dialog */}
      <ViewQuestionDialog
        question={viewingQuestion}
        open={Boolean(viewingQuestion)}
        onOpenChange={(open) => !open && setViewingQuestion(null)}
      />
    </div>
  );
}
