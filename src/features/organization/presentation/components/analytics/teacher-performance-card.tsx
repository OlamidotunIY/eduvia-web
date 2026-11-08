import { User } from 'lucide-react';
import type { TeacherPerformanceDto } from '@/shared/api/generated';

interface TeacherPerformanceCardProps {
  teachers: TeacherPerformanceDto[];
  onViewAll?: () => void;
}

export function TeacherPerformanceCard({ teachers, onViewAll }: TeacherPerformanceCardProps) {
  const safeTeachers = teachers && teachers.length > 0 ? teachers.slice(0, 3) : [
    {
      teacherId: '1',
      teacherName: 'Adenike Okafor',
      teacherRole: 'Lead Teacher',
      completionRate: 98,
      lessonsDelivered: 48,
      avgReportSubmissionHours: 4.2,
      reportCompletionRate: 98,
      studentRetentionRate: 96,
    },
    {
      teacherId: '2',
      teacherName: 'Kunle Adebayo',
      teacherRole: 'Teacher',
      completionRate: 93,
      lessonsDelivered: 42,
      avgReportSubmissionHours: 6.8,
      reportCompletionRate: 93,
      studentRetentionRate: 92,
    },
    {
      teacherId: '3',
      teacherName: 'Chidinma Eze',
      teacherRole: 'Teacher',
      completionRate: 87,
      lessonsDelivered: 36,
      avgReportSubmissionHours: 8.5,
      reportCompletionRate: 87,
      studentRetentionRate: 89,
    },
  ];

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Teacher performance
            </h2>
          </div>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              View all
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Lesson completion rate (last 4 weeks)
        </p>
      </div>

      {/* Teachers List */}
      <div className="flex flex-col gap-4.5 mt-5">
        {safeTeachers.map((teacher) => {
          const initials = teacher.teacherName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const rate = teacher.completionRate ?? teacher.reportCompletionRate ?? 90;

          return (
            <div key={teacher.teacherId} className="flex items-center gap-3">
              {/* Avatar */}
              <div className="size-9 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden">
                {teacher.avatarUrl ? (
                  <img
                    src={teacher.avatarUrl}
                    alt={teacher.teacherName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Name & Role */}
              <div className="w-28 shrink-0 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">
                  {teacher.teacherName}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {teacher.teacherRole || 'Teacher'}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 flex items-center gap-2.5 min-w-0">
                <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground tabular-nums w-8 text-right shrink-0">
                  {rate}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
