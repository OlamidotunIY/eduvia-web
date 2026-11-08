import { useMemo } from 'react';
import { Clock, Info } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import type { ChartOptions, ChartData } from 'chart.js';
import type { LessonCompletionBreakdownDto } from '@/shared/api/generated';
import './chart-setup';

interface TeachingOperationsCardProps {
  avgReportSubmissionTimeHours: number;
  avgReportSubmissionTrend: number;
  completionBreakdown: LessonCompletionBreakdownDto;
}

const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  animation: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#090d11',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: '#1e293b',
      borderWidth: 1,
      padding: 8,
      cornerRadius: 6,
      callbacks: {
        label: (context) => ` ${context.label}: ${context.parsed}%`,
      },
    },
  },
};

export function TeachingOperationsCard({
  avgReportSubmissionTimeHours,
  avgReportSubmissionTrend,
  completionBreakdown,
}: TeachingOperationsCardProps) {
  const breakdown = completionBreakdown || {
    completedPercentage: 0,
    inProgressPercentage: 0,
    notStartedPercentage: 0,
  };

  const totalPercentage =
    (breakdown.completedPercentage ?? 0) +
    (breakdown.inProgressPercentage ?? 0) +
    (breakdown.notStartedPercentage ?? 0);
  const hasLessons = totalPercentage > 0;

  const doughnutData: ChartData<'doughnut'> = useMemo(() => {
    if (!hasLessons) {
      return {
        labels: ['No lessons recorded'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#1e293b'],
            borderColor: '#0b0f14',
            borderWidth: 2,
            hoverOffset: 0,
          },
        ],
      };
    }
    return {
      labels: ['Completed', 'In progress', 'Not started'],
      datasets: [
        {
          data: [
            breakdown.completedPercentage ?? 0,
            breakdown.inProgressPercentage ?? 0,
            breakdown.notStartedPercentage ?? 0,
          ],
          backgroundColor: ['#10b981', '#0f766e', '#334155'],
          borderColor: '#0b0f14',
          borderWidth: 2,
          hoverOffset: 3,
        },
      ],
    };
  }, [breakdown, hasLessons]);

  const formattedHours = (avgReportSubmissionTimeHours ?? 0).toFixed(1);
  const hasTrend = avgReportSubmissionTrend !== 0;
  const trendPositive = avgReportSubmissionTrend < 0; // faster submission is positive!

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-emerald-400" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Teaching operations
          </h2>
        </div>
        <button
          type="button"
          className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          title="Teaching operational statistics"
        >
          <Info className="size-4" />
        </button>
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-auto pt-2">
        {/* Left Column: Avg Submission Time */}
        <div className="flex flex-col justify-center">
          <span className="text-xs text-muted-foreground">
            Avg. report submission time
          </span>
          <div className="text-3xl font-bold text-foreground mt-2 font-sans tracking-tight">
            {formattedHours} hrs
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs">
            {hasTrend ? (
              <>
                <span
                  className={`font-medium ${
                    trendPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {trendPositive ? '↓' : '↑'} {Math.abs(avgReportSubmissionTrend)}%
                </span>
                <span className="text-muted-foreground text-[11px]">
                  vs. last month
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-[11px]">
                0% vs. last month
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Donut + Legend */}
        <div className="flex flex-col justify-center">
          <span className="text-xs text-muted-foreground mb-2">
            Lesson completion breakdown
          </span>

          <div className="flex items-center gap-4">
            {/* Donut with center text */}
            <div className="relative size-24 shrink-0">
              <Doughnut options={doughnutOptions} data={doughnutData} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-foreground font-sans leading-none">
                  {(breakdown.completedPercentage ?? 0).toFixed(1)}%
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5 leading-none">
                  Completed
                </span>
              </div>
            </div>

            {/* Slices Legend */}
            <div className="flex flex-col gap-1.5 text-xs min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-muted-foreground text-[11px] truncate">
                    Completed
                  </span>
                </div>
                <span className="font-medium text-foreground text-[11px] tabular-nums">
                  {(breakdown.completedPercentage ?? 0).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="size-2 rounded-full bg-[#0f766e] shrink-0" />
                  <span className="text-muted-foreground text-[11px] truncate">
                    In progress
                  </span>
                </div>
                <span className="font-medium text-foreground text-[11px] tabular-nums">
                  {(breakdown.inProgressPercentage ?? 0).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="size-2 rounded-full bg-slate-600 shrink-0" />
                  <span className="text-muted-foreground text-[11px] truncate">
                    Not started
                  </span>
                </div>
                <span className="font-medium text-foreground text-[11px] tabular-nums">
                  {(breakdown.notStartedPercentage ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
