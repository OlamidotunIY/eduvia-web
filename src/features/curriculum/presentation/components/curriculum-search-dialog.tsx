import { useState } from "react";
import {
  BookOpen,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { useCurriculumSearchQuery } from "../../application";
import type { CurriculumSearchResult } from "@/shared/domain";

interface CurriculumSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  activeCurriculumId?: string;
  onSelectResult: (result: CurriculumSearchResult) => void;
}

export function CurriculumSearchDialog({
  open,
  onOpenChange,
  organizationId,
  activeCurriculumId,
  onSelectResult,
}: CurriculumSearchDialogProps) {
  const [query, setQuery] = useState("");

  const searchResults = useCurriculumSearchQuery(
    organizationId,
    query,
    activeCurriculumId,
  );

  const handleSelect = (item: CurriculumSearchResult) => {
    onSelectResult(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="border-b border-border/60 p-4">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <DialogTitle className="text-base font-semibold">
              Search Curriculum & Standards
            </DialogTitle>
          </div>
          <div className="relative mt-2">
            <Input
              type="text"
              placeholder="Search topics, strands, keywords, or codes (e.g. 'linear', 'fractions', 'MAT')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pr-9 text-sm"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[420px] min-h-[160px] overflow-y-auto p-2">
          {searchResults.isLoading ? (
            <div className="flex h-36 items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Searching curriculum...
            </div>
          ) : query.trim().length < 2 ? (
            <div className="flex h-36 flex-col items-center justify-center text-center text-xs text-muted-foreground">
              <BookOpen className="mb-2 size-6 text-muted-foreground/40" />
              Type at least 2 characters to search standards and objectives.
            </div>
          ) : searchResults.data && searchResults.data.length > 0 ? (
            <div className="space-y-1">
              {searchResults.data.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="flex w-full flex-col items-start gap-1 rounded-md p-2.5 text-left transition hover:bg-muted/70 focus-visible:bg-muted"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-4 capitalize">
                        {item.nodeType}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">
                        {item.name}
                      </span>
                    </div>
                    {item.code && (
                      <span className="font-mono text-xs text-primary">
                        {item.code}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}

                  {item.gradeLevel && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span>Grade: {item.gradeLevel}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-36 flex-col items-center justify-center text-center text-xs text-muted-foreground">
              No curriculum nodes matched "{query}".
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
