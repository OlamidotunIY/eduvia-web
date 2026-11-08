import { User, GraduationCap } from 'lucide-react';
import type { TeacherPerformanceDto } from '@/shared/api/generated';

interface TeacherPerformanceCardProps {
  teachers: TeacherPerformanceDto[];
  onViewAll?: () => void;
}

export function TeacherPerformanceCard({
  teachers,
  onViewAll,
}: TeacherPerformanceCardProps) {
  const hasTeachers = teachers && teachers.length > 0;
  const displayTeachers = hasTeachers ? teachers.slice(0, 3) : [];

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
          {hasTeachers && onViewAll && (
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

      {/* Content: List or Empty State */}
      {hasTeachers ? (
        <div className="flex flex-col gap-4.5 mt-5">
          {displayTeachers.map((teacher) => {
            const initials = teacher.teacherName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const rate =
              teacher.completionRate ?? teacher.reportCompletionRate ?? 0;

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
                      className={`h-full rounded-full transition-all duration-500 ${
                        rate > 0 ? 'bg-emerald-500' : 'bg-transparent'
                      }`}
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
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center py-7 px-4 my-auto">
          <div className="size-10 rounded-full bg-muted/40 border border-border text-muted-foreground flex items-center justify-center mb-2.5">
            <GraduationCap className="size-5" />
          </div>
          <p className="text-xs font-medium text-foreground">
            No teacher performance data yet
          </p>
          <p className="text-[11px] text-muted-foreground max-w-[220px] mt-1 leading-normal">
            Completion metrics will appear here once teachers deliver lessons and submit reports.
          </p>
        </div>
      )}
    </div>
  );
}
