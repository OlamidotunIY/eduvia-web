import { Bell, Check, SearchX } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface NotificationEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function NotificationEmptyState({
  isFiltered = false,
  onClearFilters,
}: NotificationEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
        <div className="relative mb-3 flex items-center justify-center">
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-muted/50 border border-border/70 text-muted-foreground shadow-xs">
            <SearchX className="size-6" />
          </div>
        </div>

        <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
          No matching notifications
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          We couldn't find any notifications matching your current search or category filter.
        </p>

        {onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-8 px-3.5 text-xs font-medium"
            onClick={onClearFilters}
          >
            Reset filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-14 sm:py-16 px-4 text-center max-w-md mx-auto">
      {/* Layered glowing badge */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute size-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
        <div className="relative flex size-16 items-center justify-center rounded-3xl bg-gradient-to-b from-primary/15 via-primary/10 to-transparent border border-primary/20 text-primary shadow-xs">
          <Bell className="size-7" />
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-background border border-primary/30 text-primary shadow-xs">
            <Check className="size-3 stroke-[3]" />
          </span>
        </div>
      </div>

      <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
        All caught up!
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        You have no new notifications right now. Upcoming session reminders, student progress reports, and tuition updates will appear here automatically.
      </p>
    </div>
  );
}
