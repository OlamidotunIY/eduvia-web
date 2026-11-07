import { CheckCircle2, Globe, Layers } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";

interface CurriculumMetricsProps {
  totalCurricula: number;
  activeCurricula: number;
  countriesRepresented: number;
  isLoading?: boolean;
}

export function CurriculumMetrics({
  totalCurricula,
  activeCurricula,
  countriesRepresented,
  isLoading = false,
}: CurriculumMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-5"
          >
            <Skeleton className="size-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Metric 1: Total curricula */}
      <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-border">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/40 text-primary">
          <Layers className="size-6 text-primary" />
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Total curricula
          </div>
          <div className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
            {totalCurricula}
          </div>
        </div>
      </div>

      {/* Metric 2: Active curricula */}
      <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-border">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/40 text-primary">
          <CheckCircle2 className="size-6 text-primary" />
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Active curricula
          </div>
          <div className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
            {activeCurricula}
          </div>
        </div>
      </div>

      {/* Metric 3: Countries represented */}
      <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-border">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/40 text-primary">
          <Globe className="size-6 text-primary" />
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Countries represented
          </div>
          <div className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
            {countriesRepresented}
          </div>
        </div>
      </div>
    </div>
  );
}
