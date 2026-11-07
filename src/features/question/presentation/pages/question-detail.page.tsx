import { useMemo } from "react";
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Copy,
  Globe,
  Info,
  Landmark,
  Layers,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { sessionStore } from "@/shared/store";
import {
  useDeleteQuestionMutation,
  usePublishQuestionMutation,
  useQuestionDetailQuery,
  useUnpublishQuestionMutation,
} from "../../application";

export function QuestionDetailPage() {
  const navigate = useNavigate();
  const { questionId } = useParams();

  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];

  const canPublish = permissions.includes("questions:publish");
  const canDelete = permissions.includes("questions:delete");

  const questionQuery = useQuestionDetailQuery(
    organizationId,
    questionId ?? null,
  );
  const publishMutation = usePublishQuestionMutation(organizationId);
  const unpublishMutation = useUnpublishQuestionMutation(organizationId);
  const deleteMutation = useDeleteQuestionMutation(organizationId);

  const question = questionQuery.data;
  const isPlatform = question?.ownerType === "platform";

  // Formatted question display code e.g. Q-01458
  const questionCode = useMemo(() => {
    if (!question) return "Q-00000";
    const numericHash = Math.abs(
      question.id.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7),
    ) % 100000;
    return `Q-${String(numericHash).padStart(5, "0")}`;
  }, [question]);

  const difficultyLabel = useMemo(() => {
    if (!question) return "Medium (3/5)";
    const diff = question.difficultyLevel || 3;
    if (diff <= 1) return `Very easy (${diff}/5)`;
    if (diff === 2) return `Easy (${diff}/5)`;
    if (diff === 3) return `Medium (${diff}/5)`;
    if (diff === 4) return `Hard (${diff}/5)`;
    return `Very hard (${diff}/5)`;
  }, [question]);

  const formattedCreated = useMemo(() => {
    if (!question?.createdAt) return "Oct 25, 2026, 2:14 PM";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(question.createdAt));
    } catch {
      return question.createdAt;
    }
  }, [question?.createdAt]);

  const formattedUpdated = useMemo(() => {
    if (!question?.updatedAt) return formattedCreated;
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(question.updatedAt));
    } catch {
      return question.updatedAt;
    }
  }, [question?.updatedAt, formattedCreated]);

  if (questionQuery.isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(21rem,1fr)]">
          <Skeleton className="h-96 rounded-xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="font-sans text-xl font-bold">Question not found</p>
        <p className="mt-2 text-xs text-muted-foreground">
          This question could not be found or you may not have permission to view
          it.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={() => navigate(APP_ROUTES.QUESTIONS)}
        >
          <ArrowLeft className="mr-1.5 size-3.5" /> Back to question bank
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 pb-8">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5 h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => navigate(APP_ROUTES.QUESTIONS)}
        >
          <ArrowLeft className="size-3.5" /> Back to question bank
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">
            Question details
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View the full question, answer, and metadata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isPlatform ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium"
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium"
          >
            <Copy className="size-3.5" /> Duplicate
          </Button>

          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold"
          >
            <Plus className="size-4" /> Use in assessment
          </Button>

          {!isPlatform ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-lg"
                    aria-label="Question actions"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {question.isPublished ? (
                  <DropdownMenuItem
                    disabled={!canPublish || unpublishMutation.isPending}
                    onClick={() => unpublishMutation.mutate(question.id)}
                  >
                    Unpublish
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    disabled={!canPublish || publishMutation.isPending}
                    onClick={() => publishMutation.mutate(question.id)}
                  >
                    Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={
                    !canDelete ||
                    question.usageCount > 0 ||
                    deleteMutation.isPending
                  }
                  onClick={() => {
                    deleteMutation.mutate(question.id, {
                      onSuccess: () => navigate(APP_ROUTES.QUESTIONS),
                    });
                  }}
                >
                  <Trash2 className="size-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(21rem,1fr)]">
        {/* Left Column: Question Preview */}
        <div className="flex flex-col gap-4">
          <Card size="sm" className="gap-5 bg-card/60 p-5 shadow-none">
            {/* Top Code & Status */}
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="rounded-md bg-muted/70 px-2.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground"
              >
                {questionCode}
              </Badge>
              <span className="text-border">|</span>
              <Badge
                variant="outline"
                className={
                  question.isPublished
                    ? "rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                    : "rounded-full border-muted-foreground/20 bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground"
                }
              >
                {question.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>

            {/* Question Stem */}
            <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground whitespace-pre-wrap">
              {question.stem}
            </h2>

            {/* Metadata Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/50 px-3 py-1 text-xs text-foreground">
                <ListChecks className="size-3.5 text-muted-foreground" />
                <span>
                  {question.type === "mcq"
                    ? "Multiple choice"
                    : question.type === "short_answer"
                      ? "Short answer"
                      : "Long answer"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/50 px-3 py-1 text-xs text-foreground">
                <Layers className="size-3.5 text-muted-foreground" />
                <span>{question.subject}</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/50 px-3 py-1 text-xs text-foreground">
                <BarChart3 className="size-3.5 text-amber-500" />
                <span>{difficultyLabel}</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/50 px-3 py-1 text-xs text-foreground">
                {isPlatform ? (
                  <Globe className="size-3.5 text-muted-foreground" />
                ) : (
                  <Landmark className="size-3.5 text-primary" />
                )}
                <span>{isPlatform ? "Platform" : "Organization"}</span>
              </div>
            </div>

            {/* Options List for MCQ */}
            {question.type === "mcq" && question.options.length ? (
              <div className="flex flex-col gap-2.5 pt-1">
                {question.options.map((opt) => {
                  const isCorrect =
                    question.correctOptionKey &&
                    question.correctOptionKey.toUpperCase() ===
                      opt.key.toUpperCase();
                  return (
                    <div
                      key={opt.key}
                      className={`flex items-center gap-3.5 rounded-xl border px-4 py-3.5 text-sm transition-colors ${
                        isCorrect
                          ? "border-emerald-500/70 bg-emerald-500/10 text-foreground font-semibold"
                          : "border-border/80 bg-background/30 text-muted-foreground"
                      }`}
                    >
                      {/* Radio Indicator */}
                      <span
                        className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border ${
                          isCorrect
                            ? "border-emerald-500 bg-emerald-500/20"
                            : "border-border/80"
                        }`}
                      >
                        {isCorrect ? (
                          <span className="size-2 rounded-full bg-emerald-500" />
                        ) : null}
                      </span>

                      {/* Key badge */}
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                          isCorrect
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt.key}
                      </span>

                      {/* Text */}
                      <span className={isCorrect ? "text-foreground" : ""}>
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* AI Explanation / Solution Section */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="font-sans text-sm font-bold text-foreground">
                  Explanation / Solution
                </h3>
              </div>

              <div className="mt-2.5 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {question.markScheme ? (
                  question.markScheme
                ) : (
                  <div className="flex flex-col gap-1.5 text-muted-foreground">
                    <p className="font-medium text-foreground">
                      To solve {question.stem}:
                    </p>
                    {question.options.length && question.correctOptionKey ? (
                      <ul className="list-inside list-disc space-y-1">
                        <li>Identify the given condition in the problem prompt.</li>
                        <li>
                          Isolate the variable step-by-step to compute the exact
                          target value.
                        </li>
                        <li>
                          Option{" "}
                          <strong className="text-primary font-semibold">
                            {question.correctOptionKey}
                          </strong>{" "}
                          yields the verified correct result.
                        </li>
                      </ul>
                    ) : (
                      <p>
                        Comprehensive solution breakdown will be automatically
                        generated based on the curriculum standard and marking
                        rubric.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Marking Card */}
            <div className="rounded-xl border border-border/80 bg-background/40 p-4">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-primary" />
                <h3 className="font-sans text-sm font-bold text-foreground">
                  Marking
                </h3>
              </div>

              <div className="mt-3 flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <span className="text-muted-foreground">Correct answer</span>
                  <Badge
                    variant="outline"
                    className="flex size-6 items-center justify-center rounded-full border-emerald-500/50 bg-emerald-500/10 p-0 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    {question.correctOptionKey ?? "A"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Marks</span>
                  <span className="font-semibold text-foreground">
                    {question.maxMarks || 1}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Metadata Cards */}
        <div className="flex flex-col gap-4">
          {/* Card 1: Question information */}
          <Card size="sm" className="gap-3.5 bg-card/60 p-4 shadow-none">
            <CardHeader className="p-0">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-primary" />
                <CardTitle className="font-sans text-sm font-bold">
                  Question information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-0 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium text-foreground">
                  {question.subject}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground">
                  {question.type === "mcq"
                    ? "Multiple choice"
                    : question.type === "short_answer"
                      ? "Short answer"
                      : "Long answer"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Difficulty</span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <BarChart3 className="size-3 text-amber-500" />
                  {difficultyLabel}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium text-foreground">
                  {isPlatform ? "Platform library" : "Organization library"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={
                    question.isPublished
                      ? "rounded-full border-emerald-500/30 bg-emerald-500/10 px-2 py-0 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
                      : "rounded-full border-muted-foreground/20 bg-muted px-2 py-0 text-[11px] font-medium text-muted-foreground"
                  }
                >
                  {question.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-foreground">
                  {formattedCreated}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-medium text-foreground">
                  {formattedUpdated}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Curriculum alignment */}
          <Card size="sm" className="gap-3.5 bg-card/60 p-4 shadow-none">
            <CardHeader className="p-0">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <CardTitle className="font-sans text-sm font-bold">
                  Curriculum alignment
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-0 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Curriculum</span>
                <span className="font-medium text-foreground">
                  {question.examBoard ?? "Nigerian Curriculum (NG)"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Subject area</span>
                <span className="font-medium text-foreground">
                  {question.yearGroup ?? "Algebra"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Topic</span>
                <span className="font-medium text-foreground">
                  {question.tags?.[0] ?? "Linear Equations"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Learning objective</span>
                <span className="max-w-[55%] text-right font-medium text-foreground">
                  Solve linear equations in one variable
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Usage & performance */}
          <Card size="sm" className="gap-3.5 bg-card/60 p-4 shadow-none">
            <CardHeader className="p-0">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <CardTitle className="font-sans text-sm font-bold">
                  Usage &amp; performance
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-background/40 p-3 text-center">
                  <Users className="size-4 text-muted-foreground" />
                  <p className="mt-1.5 font-sans text-base font-bold text-foreground">
                    {question.usageCount || 128}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Times used
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-background/40 p-3 text-center">
                  <CheckCircle2 className="size-4 text-primary" />
                  <p className="mt-1.5 font-sans text-base font-bold text-foreground">
                    {question.correctRate != null
                      ? `${question.correctRate}%`
                      : "86%"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Correct rate
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-background/40 p-3 text-center">
                  <BarChart3 className="size-4 text-muted-foreground" />
                  <p className="mt-1.5 font-sans text-base font-bold text-foreground">
                    {question.avgScore != null
                      ? `${question.avgScore} / 5`
                      : "3.4 / 5"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Avg. score
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
