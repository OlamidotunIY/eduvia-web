import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions, ChartData } from 'chart.js';
import type { WeeklyLessonComparisonDto } from '@/shared/api/generated';
import './chart-setup';

interface LessonsCompletedChartProps {
  data: WeeklyLessonComparisonDto[];
}

const DEFAULT_WEEKS: WeeklyLessonComparisonDto[] = [
  { week: 'Week 1', thisMonth: 0, lastMonth: 0 },
  { week: 'Week 2', thisMonth: 0, lastMonth: 0 },
  { week: 'Week 3', thisMonth: 0, lastMonth: 0 },
  { week: 'Week 4', thisMonth: 0, lastMonth: 0 },
];

export function LessonsCompletedChart({ data }: LessonsCompletedChartProps) {
  const chartRef = useRef<any>(null);

  const safeData = data && data.length > 0 ? data : DEFAULT_WEEKS;
  const hasCompletedLessons = safeData.some(
    (d) => (d.thisMonth ?? 0) > 0 || (d.lastMonth ?? 0) > 0,
  );

  const chartData: ChartData<'line'> = useMemo(() => {
    const labels = safeData.map((d) => d.week);
    const thisMonthValues = safeData.map((d) => d.thisMonth ?? 0);
    const lastMonthValues = safeData.map((d) => d.lastMonth ?? 0);

    return {
      labels,
      datasets: [
        {
          label: 'This month',
          data: thisMonthValues,
          borderColor: '#10b981',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
            return gradient;
          },
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#064e3b',
          pointBorderWidth: 2,
          pointRadius: 4.5,
          pointHoverRadius: 6.5,
        },
        {
          label: 'Last month',
          data: lastMonthValues,
          borderColor: '#64748b',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#64748b',
          pointBorderColor: '#1e293b',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [safeData]);

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
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
          padding: 10,
          cornerRadius: 8,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 11,
              weight: 'normal',
            },
            padding: 8,
          },
          border: {
            display: false,
          },
        },
        y: {
          min: 0,
          suggestedMax: hasCompletedLessons ? undefined : 10,
          ticks: {
            stepSize: hasCompletedLessons ? undefined : 2,
            color: '#94a3b8',
            font: {
              size: 11,
            },
            padding: 8,
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          border: {
            display: false,
            dash: [4, 4],
          },
        },
      },
    }),
    [hasCompletedLessons],
  );

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 h-full">
      {/* Header with Title & Legend */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-base font-semibold text-foreground tracking-tight">
          Lessons completed
        </h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground text-xs">This month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-500" />
            <span className="text-muted-foreground text-xs">Last month</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full h-64 sm:h-72 mt-2">
        <Line ref={chartRef} options={options} data={chartData} />
        {!hasCompletedLessons && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-medium text-muted-foreground/70 bg-card/80 border border-border/60 px-3.5 py-1.5 rounded-full backdrop-blur-xs shadow-xs">
              No completed lessons recorded this period
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
