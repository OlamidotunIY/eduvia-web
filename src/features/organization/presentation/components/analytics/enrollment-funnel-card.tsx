import { Layers } from 'lucide-react';
import type { FunnelStageDto } from '@/shared/api/generated';

interface EnrollmentFunnelCardProps {
  stages?: FunnelStageDto[];
}

const DEFAULT_STAGES: FunnelStageDto[] = [
  { stage: 'Invited', count: 0, percentage: 0 },
  { stage: 'Registered', count: 0, percentage: 0 },
  { stage: 'Active', count: 0, percentage: 0 },
  { stage: 'Engaged (last 7 days)', count: 0, percentage: 0 },
];

export function EnrollmentFunnelCard({ stages }: EnrollmentFunnelCardProps) {
  const safeStages: FunnelStageDto[] =
    stages && stages.length > 0 ? stages : DEFAULT_STAGES;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 h-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Enrollment funnel
          </h2>
        </div>
      </div>

      {/* Stages List */}
      <div className="flex flex-col gap-4 mt-6">
        {safeStages.map((stage) => {
          const clampedPercentage = Math.min(
            100,
            Math.max(0, stage.percentage ?? 0),
          );
          const hasProgress = clampedPercentage > 0;

          return (
            <div key={stage.stage} className="flex items-center gap-3">
              {/* Stage label */}
              <div className="text-xs text-muted-foreground w-28 shrink-0 truncate">
                {stage.stage}
              </div>

              {/* Count */}
              <div className="text-xs font-medium text-foreground tabular-nums w-8 shrink-0 text-right">
                {stage.count ?? 0}
              </div>

              {/* Progress bar */}
              <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    hasProgress ? 'bg-emerald-500' : 'bg-transparent'
                  }`}
                  style={{ width: `${clampedPercentage}%` }}
                />
              </div>

              {/* Percentage */}
              <div className="text-xs font-medium text-foreground tabular-nums w-12 shrink-0 text-right">
                {(stage.percentage ?? 0).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
