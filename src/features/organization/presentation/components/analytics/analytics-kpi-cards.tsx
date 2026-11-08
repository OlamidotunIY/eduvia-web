import { useMemo } from 'react';
import { Users, UserCheck, BookOpen, CheckCircle2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions, ChartData } from 'chart.js';
import './chart-setup';

interface AnalyticsKpiCardsProps {
  totalActiveStudents: number;
  activeLearnersTrend: number;
  activeLearnersSparkline: number[];
  totalActiveTeachers: number;
  activeTeachersTrend: number;
  activeTeachersSparkline: number[];
  totalLessonsThisMonth: number;
  totalLessonsLastMonth: number;
  lessonsTrend: number;
  lessonsSparkline: number[];
  avgLessonCompletionRate: number;
  completionRateTrend: number;
  completionRateSparkline: number[];
}

const sparklineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: { display: false },
    y: { display: false, min: 0 },
  },
  elements: {
    point: { radius: 0 },
    line: {
      borderColor: '#10b981',
      borderWidth: 2,
      tension: 0.45,
    },
  },
};

function createSparklineData(points: number[]): ChartData<'line'> {
  const safePoints = points && points.length > 0 ? points : [0, 0, 0, 0, 0];
  const hasValues = safePoints.some((p) => p > 0);
  return {
    labels: safePoints.map((_, i) => String(i)),
    datasets: [
      {
        data: safePoints,
        borderColor: hasValues ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1.8,
        tension: 0.45,
      },
    ],
  };
}

function TrendIndicator({ trend, text }: { trend: number; text?: string }) {
  if (trend > 0) {
    return (
      <span className="font-medium text-emerald-400">
        ↑ {trend}% {text}
      </span>
    );
  }
  if (trend < 0) {
    return (
      <span className="font-medium text-rose-400">
        ↓ {Math.abs(trend)}% {text}
      </span>
    );
  }
  return <span className="font-medium text-muted-foreground">0% {text}</span>;
}

export function AnalyticsKpiCards({
  totalActiveStudents,
  activeLearnersTrend,
  activeLearnersSparkline,
  totalActiveTeachers,
  activeTeachersTrend,
  activeTeachersSparkline,
  totalLessonsThisMonth,
  totalLessonsLastMonth,
  lessonsTrend,
  lessonsSparkline,
  avgLessonCompletionRate,
  completionRateTrend,
  completionRateSparkline,
}: AnalyticsKpiCardsProps) {
  const learnersSparkline = useMemo(
    () => createSparklineData(activeLearnersSparkline),
    [activeLearnersSparkline],
  );
  const teachersSparkline = useMemo(
    () => createSparklineData(activeTeachersSparkline),
    [activeTeachersSparkline],
  );
  const lessonsChartSparkline = useMemo(
    () => createSparklineData(lessonsSparkline),
    [lessonsSparkline],
  );
  const completionSparkline = useMemo(
    () => createSparklineData(completionRateSparkline),
    [completionRateSparkline],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Active Learners */}
      <div className="relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Active learners
            </span>
            <div className="text-2xl font-bold text-foreground mt-1.5 font-sans">
              {(totalActiveStudents ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <Users className="size-4" />
          </div>
        </div>

        <div className="flex items-end justify-between mt-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <TrendIndicator trend={activeLearnersTrend ?? 0} />
            <span className="text-muted-foreground text-[11px]">
              vs. last month
            </span>
          </div>
          <div className="w-16 h-8 shrink-0">
            <Line options={sparklineOptions} data={learnersSparkline} />
          </div>
        </div>
      </div>

      {/* 2. Active Teachers */}
      <div className="relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Active teachers
            </span>
            <div className="text-2xl font-bold text-foreground mt-1.5 font-sans">
              {(totalActiveTeachers ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <UserCheck className="size-4" />
          </div>
        </div>

        <div className="flex items-end justify-between mt-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <TrendIndicator trend={activeTeachersTrend ?? 0} />
            <span className="text-muted-foreground text-[11px]">
              vs. last month
            </span>
          </div>
          <div className="w-16 h-8 shrink-0">
            <Line options={sparklineOptions} data={teachersSparkline} />
          </div>
        </div>
      </div>

      {/* 3. Lessons this month */}
      <div className="relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Lessons this month
            </span>
            <div className="text-2xl font-bold text-foreground mt-1.5 font-sans">
              {(totalLessonsThisMonth ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <BookOpen className="size-4" />
          </div>
        </div>

        <div className="flex items-end justify-between mt-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs">
            {totalLessonsLastMonth > 0 && (
              <span className="text-muted-foreground text-[11px]">
                vs. last month {totalLessonsLastMonth}
              </span>
            )}
            <TrendIndicator trend={lessonsTrend ?? 0} />
            {totalLessonsLastMonth === 0 && (
              <span className="text-muted-foreground text-[11px]">
                vs. last month
              </span>
            )}
          </div>
          <div className="w-16 h-8 shrink-0">
            <Line options={sparklineOptions} data={lessonsChartSparkline} />
          </div>
        </div>
      </div>

      {/* 4. Lesson completion */}
      <div className="relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Lesson completion
            </span>
            <div className="text-2xl font-bold text-foreground mt-1.5 font-sans">
              {(avgLessonCompletionRate ?? 0).toFixed(1)}%
            </div>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <CheckCircle2 className="size-4" />
          </div>
        </div>

        <div className="flex items-end justify-between mt-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <TrendIndicator trend={completionRateTrend ?? 0} />
            <span className="text-muted-foreground text-[11px]">
              vs. last month
            </span>
          </div>
          <div className="w-16 h-8 shrink-0">
            <Line options={sparklineOptions} data={completionSparkline} />
          </div>
        </div>
      </div>
    </div>
  );
}
