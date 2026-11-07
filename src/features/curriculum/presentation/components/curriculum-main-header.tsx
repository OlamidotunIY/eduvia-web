import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Layers, Plus, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { APP_ROUTES } from "@/shared/constant/routes.constants";

interface CurriculumMainHeaderProps {
  headerSlot: HTMLDivElement | null;
  onOpenSearch: () => void;
  onAddCurriculum: () => void;
}

export function CurriculumMainHeader({
  headerSlot,
  onOpenSearch,
  onAddCurriculum,
}: CurriculumMainHeaderProps) {
  if (!headerSlot) return null;

  return createPortal(
    <div className="flex w-full min-w-0 items-center justify-end gap-2 overflow-hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenSearch}
        className="h-8 gap-2 bg-background/60 text-xs text-muted-foreground hover:bg-accent hover:text-foreground border-border/70"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search standards...</span>
        <kbd className="pointer-events-none hidden h-4.5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-80 sm:inline-flex">
          /
        </kbd>
      </Button>

      <Button
        variant="outline"
        size="sm"
        render={<Link to={APP_ROUTES.SUBJECTS} />}
        className="h-8 gap-1.5 text-xs font-medium text-foreground border-border/70 bg-card/60 hover:bg-muted"
      >
        <Layers className="size-3.5 text-foreground/80" />
        <span>Subjects</span>
      </Button>

      <Button
        size="sm"
        onClick={onAddCurriculum}
        className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium"
      >
        <Plus className="size-3.5" />
        <span>Add curriculum</span>
      </Button>
    </div>,
    headerSlot,
  );
}
