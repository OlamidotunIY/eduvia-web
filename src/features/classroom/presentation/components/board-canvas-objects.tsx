import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  EyeOff,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Maximize2,
  MessageSquareText,
  Pencil,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import type { BoardMode, BoardQuestion, BoardSection } from "@/shared/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { useMyBoardResponseQuery } from "../../application";

interface DragOffset {
  dx: number;
  dy: number;
}

function parseFileSection(
  content: string,
): { fileName: string; url: string; isPdf: boolean } | null {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const urlLine = lines.find((line) => /^https?:\/\//i.test(line));
  if (!urlLine) return null;

  const titleLine = lines.find((line) => line !== urlLine);
  let fallbackName = "Attached file";
  try {
    const pathname = new URL(urlLine).pathname;
    const rawSegment = pathname.split("/").pop() ?? "";
    fallbackName = decodeURIComponent(rawSegment) || fallbackName;
  } catch {
    // keep default
  }
  const fileName = titleLine || fallbackName;
  const isPdf = /\.pdf(\?|$)/i.test(urlLine) || /\.pdf$/i.test(fileName);
  return { fileName, url: urlLine, isPdf };
}

function DraggableBoardCard({
  cardId,
  side,
  index,
  offset,
  onOffsetChange,
  collapsed,
  onToggleCollapse,
  headerBadge,
  collapsedLabel,
  cardClassName,
  children,
}: {
  cardId: string;
  side: "left" | "right";
  index: number;
  offset: DragOffset;
  onOffsetChange: (id: string, next: DragOffset) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  headerBadge: ReactNode;
  collapsedLabel: string;
  cardClassName?: string;
  children: ReactNode;
}) {
  const dragOriginRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    baseDx: number;
    baseDy: number;
  } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOriginRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      baseDx: offset.dx,
      baseDy: offset.dy,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = dragOriginRef.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    const dx = origin.baseDx + (event.clientX - origin.startClientX);
    const dy = origin.baseDy + (event.clientY - origin.startClientY);
    onOffsetChange(cardId, { dx, dy });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = dragOriginRef.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    dragOriginRef.current = null;
  };

  // Position cards cleanly in neat columns below top HUD inside initial visible area
  const baseTop = collapsed
    ? 76 + index * 46
    : 76 + Math.min(index, 2) * 195 + Math.max(0, index - 2) * 48;
  const horizontalLeft = side === "left" ? 16 : 920;

  if (collapsed) {
    return (
      <div
        style={{
          top: `${baseTop}px`,
          left: `${horizontalLeft}px`,
          transform: `translate3d(${offset.dx}px, ${offset.dy}px, 0)`,
        }}
        className="pointer-events-auto absolute z-10 flex max-w-60 items-center gap-1 rounded-full border border-border/80 bg-background/95 py-1 pr-1.5 pl-2 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md"
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          title="Drag to reposition"
        >
          <GripVertical className="size-3.5" />
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-xs font-medium text-foreground hover:text-primary"
        >
          {headerBadge}
          <span className="truncate">{collapsedLabel}</span>
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <article
      style={{
        top: `${baseTop}px`,
        left: `${horizontalLeft}px`,
        transform: `translate3d(${offset.dx}px, ${offset.dy}px, 0)`,
      }}
      className={cn(
        "pointer-events-auto absolute z-10 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border/80 bg-card/95 shadow-md backdrop-blur-md",
        cardClassName,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex min-w-0 flex-1 cursor-grab items-center gap-1.5 touch-none active:cursor-grabbing"
          title="Drag card across board"
        >
          <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {headerBadge}
          </div>
        </div>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label="Collapse board card"
          className="size-6 shrink-0 rounded-md"
          onClick={onToggleCollapse}
        >
          <ChevronUp className="size-3.5" />
        </Button>
      </div>
      <div className="p-3">{children}</div>
    </article>
  );
}

function OnBoardQuestionCard({
  index,
  boardId,
  boardMode,
  isBoardLocked,
  item,
  canControlBoard,
  isStudent,
  offset,
  collapsed,
  onOffsetChange,
  onToggleCollapse,
  onAnswer,
  onReviewResponses,
  onRemove,
}: {
  index: number;
  boardId: string;
  boardMode: BoardMode;
  isBoardLocked: boolean;
  item: BoardQuestion;
  canControlBoard: boolean;
  isStudent: boolean;
  offset: DragOffset;
  collapsed: boolean;
  onOffsetChange: (id: string, next: DragOffset) => void;
  onToggleCollapse: () => void;
  onAnswer: () => void;
  onReviewResponses: () => void;
  onRemove: () => void;
}) {
  const myResponseQuery = useMyBoardResponseQuery(
    boardId,
    item.id,
    isStudent,
  );
  const myResponse = myResponseQuery.data;
  const award =
    myResponse?.teacherMark?.marksAwarded ??
    myResponse?.autoMarkResult?.marksAwarded ??
    null;
  const maxMarks = myResponse?.teacherMark?.maxMarks ?? item.maxMarks;

  const isHighlightedMode =
    (boardMode === "classwork" && item.mode === "classwork") ||
    (boardMode === "assignment" && item.mode === "assignment");

  const headerBadge = (
    <>
      <Badge
        variant={isHighlightedMode ? "default" : "secondary"}
        className="text-[11px] font-semibold tabular-nums"
      >
        Q{index + 1}
      </Badge>
      <span className="text-[11px] font-medium capitalize text-muted-foreground">
        {item.mode} · {item.maxMarks}m
      </span>
      {award !== null ? (
        <Badge className="gap-1 bg-emerald-600 text-[10px] text-white">
          <CheckCircle2 className="size-2.5" />
          {award}/{maxMarks}
        </Badge>
      ) : null}
    </>
  );

  return (
    <DraggableBoardCard
      cardId={`q:${item.id}`}
      side="left"
      index={index}
      offset={offset}
      onOffsetChange={onOffsetChange}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      headerBadge={headerBadge}
      collapsedLabel={item.question?.stem ?? "Attached question"}
      cardClassName={
        isHighlightedMode ? "border-primary/40 ring-1 ring-primary/15" : ""
      }
    >
      <div className="space-y-3">
        <p className="text-sm font-medium leading-snug text-foreground">
          {item.question?.stem ?? `Question #${item.questionId}`}
        </p>

        {item.showOptions &&
        item.question?.options &&
        item.question.options.length > 0 ? (
          <div className="space-y-1.5">
            {item.question.options.map((opt) => {
              const chosen = myResponse?.selectedOption === opt.key;
              return (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                    chosen
                      ? "border-primary bg-primary/10 font-medium text-foreground"
                      : "border-border/70 bg-muted/30 text-foreground",
                  )}
                >
                  <span className="font-semibold text-primary">{opt.key}.</span>
                  <span>{opt.text}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        {isStudent && myResponse?.teacherMark?.feedback ? (
          <p className="rounded-md bg-primary/5 px-2.5 py-1.5 text-xs text-foreground">
            <span className="font-semibold">Feedback: </span>
            {myResponse.teacherMark.feedback}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-border/60 pt-2">
          {isStudent ? (
            <Button
              type="button"
              size="xs"
              variant={myResponse ? "outline" : "default"}
              disabled={isBoardLocked || boardMode === "locked"}
              onClick={onAnswer}
              className="w-full"
            >
              <MessageSquareText className="size-3.5" />
              {isBoardLocked || boardMode === "locked"
                ? "Board locked"
                : myResponse
                  ? "Update answer"
                  : "Answer question"}
            </Button>
          ) : null}

          {canControlBoard ? (
            <>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={onReviewResponses}
                className="flex-1"
              >
                <Users className="size-3.5" /> Responses
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label="Remove question from board"
                className="text-muted-foreground hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </DraggableBoardCard>
  );
}

export function BoardCanvasObjectsLayer({
  boardId,
  boardMode,
  isBoardLocked,
  questions,
  sections,
  canControlBoard,
  canEditMaterials,
  isStudent,
  allCollapsed,
  onAnswerQuestion,
  onReviewQuestion,
  onRemoveQuestion,
  onEditNoteSection,
  onRemoveSection,
}: {
  boardId: string;
  boardMode: BoardMode;
  isBoardLocked: boolean;
  questions: BoardQuestion[];
  sections: BoardSection[];
  canControlBoard: boolean;
  canEditMaterials: boolean;
  isStudent: boolean;
  allCollapsed: boolean;
  onAnswerQuestion: (q: BoardQuestion) => void;
  onReviewQuestion: (q: BoardQuestion) => void;
  onRemoveQuestion: (boardQuestionId: string) => void;
  onEditNoteSection: (section: BoardSection) => void;
  onRemoveSection: (sectionId: string) => void;
}) {
  const [offsets, setOffsets] = useState<Record<string, DragOffset>>({});
  const [cardCollapseOverride, setCardCollapseOverride] = useState<
    Record<string, boolean>
  >({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<{
    fileName: string;
    url: string;
    isPdf: boolean;
  } | null>(null);

  const visibleSections = canControlBoard
    ? sections.filter((s) => s.type !== "divider")
    : sections.filter((s) => s.type !== "divider" && !s.isTeacherOnly);

  const updateOffset = (id: string, next: DragOffset) => {
    setOffsets((prev) => ({ ...prev, [id]: next }));
  };

  const isCollapsed = (id: string, defaultCollapsed: boolean) => {
    if (cardCollapseOverride[id] !== undefined) {
      return cardCollapseOverride[id];
    }
    return allCollapsed || defaultCollapsed;
  };

  const toggleCollapse = (id: string, current: boolean) => {
    setCardCollapseOverride((prev) => ({ ...prev, [id]: !current }));
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {/* Attached Questions — always rendered directly ON the board */}
        {questions.map((item, idx) => {
          const cardId = `q:${item.id}`;
          const collapsed = isCollapsed(cardId, idx >= 2);
          return (
            <OnBoardQuestionCard
              key={item.id}
              index={idx}
              boardId={boardId}
              boardMode={boardMode}
              isBoardLocked={isBoardLocked}
              item={item}
              canControlBoard={canControlBoard}
              isStudent={isStudent}
              offset={offsets[cardId] ?? { dx: 0, dy: 0 }}
              collapsed={collapsed}
              onOffsetChange={updateOffset}
              onToggleCollapse={() => toggleCollapse(cardId, collapsed)}
              onAnswer={() => onAnswerQuestion(item)}
              onReviewResponses={() => onReviewQuestion(item)}
              onRemove={() => onRemoveQuestion(item.id)}
            />
          );
        })}

        {/* Uploaded Images, PDFs/Documents & Sticky Notes pinned ON the board */}
        {visibleSections.map((section, idx) => {
          const cardId = `s:${section.id}`;
          const collapsed = isCollapsed(cardId, idx >= 2);
          const parsedFile =
            section.type === "text" ? parseFileSection(section.content) : null;

          if (section.type === "image") {
            return (
              <DraggableBoardCard
                key={section.id}
                cardId={cardId}
                side="right"
                index={idx}
                offset={offsets[cardId] ?? { dx: 0, dy: 0 }}
                onOffsetChange={updateOffset}
                collapsed={collapsed}
                onToggleCollapse={() => toggleCollapse(cardId, collapsed)}
                headerBadge={
                  <>
                    <ImageIcon className="size-3.5 text-primary" />
                    <span className="text-[11px] font-medium">Image</span>
                    {section.isTeacherOnly ? (
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <EyeOff className="size-2.5" /> Private
                      </Badge>
                    ) : null}
                  </>
                }
                collapsedLabel="Board image"
              >
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(section.content)}
                    className="group relative block w-full overflow-hidden rounded-lg border border-border/80 bg-muted/20"
                  >
                    <img
                      src={section.content}
                      alt="Board attachment"
                      className="max-h-44 w-full object-contain"
                    />
                    <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground opacity-0 shadow-xs transition-opacity group-hover:opacity-100">
                      <Maximize2 className="size-3" /> Enlarge
                    </span>
                  </button>
                  {canEditMaterials ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Remove image"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveSection(section.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </DraggableBoardCard>
            );
          }

          if (parsedFile) {
            return (
              <DraggableBoardCard
                key={section.id}
                cardId={cardId}
                side="right"
                index={idx}
                offset={offsets[cardId] ?? { dx: 0, dy: 0 }}
                onOffsetChange={updateOffset}
                collapsed={collapsed}
                onToggleCollapse={() => toggleCollapse(cardId, collapsed)}
                headerBadge={
                  <>
                    <FileText className="size-3.5 text-primary" />
                    <span className="text-[11px] font-medium uppercase">
                      {parsedFile.isPdf ? "PDF" : "Document"}
                    </span>
                    {section.isTeacherOnly ? (
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <EyeOff className="size-2.5" /> Private
                      </Badge>
                    ) : null}
                  </>
                }
                collapsedLabel={parsedFile.fileName}
              >
                <div className="space-y-3">
                  <p className="truncate text-sm font-medium text-foreground">
                    {parsedFile.fileName}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPreviewDocument(parsedFile)}
                    >
                      <ExternalLink className="size-3.5" />
                      {parsedFile.isPdf ? "Preview PDF" : "Open document"}
                    </Button>
                    {canEditMaterials ? (
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Remove document"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveSection(section.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </DraggableBoardCard>
            );
          }

          // Plain Sticky Note card
          return (
            <DraggableBoardCard
              key={section.id}
              cardId={cardId}
              side="right"
              index={idx}
              offset={offsets[cardId] ?? { dx: 0, dy: 0 }}
              onOffsetChange={updateOffset}
              collapsed={collapsed}
              onToggleCollapse={() => toggleCollapse(cardId, collapsed)}
              headerBadge={
                <>
                  <StickyNote className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-medium">Note</span>
                  {section.isTeacherOnly ? (
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <EyeOff className="size-2.5" /> Private
                    </Badge>
                  ) : null}
                </>
              }
              collapsedLabel={section.content.split("\n")[0] || "Board note"}
              cardClassName="border-amber-300/70 bg-amber-50/95 dark:border-amber-500/30 dark:bg-amber-950/75"
            >
              <div className="space-y-2.5">
                <p className="whitespace-pre-line text-sm text-foreground">
                  {section.content}
                </p>
                {canEditMaterials ? (
                  <div className="flex justify-end gap-1 border-t border-amber-500/15 pt-1.5">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Edit note"
                      onClick={() => onEditNoteSection(section)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Delete note"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveSection(section.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </DraggableBoardCard>
          );
        })}
      </div>

      {/* Image Lightbox */}
      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Board image</DialogTitle>
          </DialogHeader>
          {previewImage ? (
            <img
              src={previewImage}
              alt="Enlarged board material"
              className="max-h-[75vh] w-full rounded-lg object-contain bg-muted/20"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* PDF / Document Preview */}
      <Dialog
        open={Boolean(previewDocument)}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4 pr-6">
              <span className="truncate">{previewDocument?.fileName}</span>
              {previewDocument ? (
                <a
                  href={previewDocument.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Open in new tab <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </DialogTitle>
          </DialogHeader>
          {previewDocument ? (
            previewDocument.isPdf ? (
              <iframe
                src={previewDocument.url}
                title={previewDocument.fileName}
                className="h-[72vh] w-full rounded-lg border border-border bg-white"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <FileText className="size-10 text-muted-foreground" />
                <p className="text-sm font-medium">{previewDocument.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  This document opens in your browser or native viewer.
                </p>
                <Button
                  type="button"
                  onClick={() =>
                    window.open(
                      previewDocument.url,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <ExternalLink className="size-4" />
                  Open document
                </Button>
              </div>
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
