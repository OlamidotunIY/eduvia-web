import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { StudentChurnRiskDto } from '@/shared/api/generated';

interface StudentsNeedingAttentionCardProps {
  students: StudentChurnRiskDto[];
  onViewAll?: () => void;
}

export function StudentsNeedingAttentionCard({
  students,
  onViewAll,
}: StudentsNeedingAttentionCardProps) {
  const hasStudents = students && students.length > 0;
  const displayStudents = hasStudents ? students.slice(0, 3) : [];

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-400" />
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Students needing attention
            </h2>
          </div>
          {hasStudents && onViewAll && (
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
          At risk based on activity, performance or inactivity
        </p>
      </div>

      {/* Content: List or Empty State */}
      {hasStudents ? (
        <div className="flex flex-col gap-4 mt-5">
          {displayStudents.map((student) => {
            const initials = student.studentName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const isHighRisk = student.riskLevel === 'high';

            return (
              <div
                key={student.studentId}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="size-9 rounded-full bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.studentName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground truncate">
                        {student.studentName}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                          isHighRisk
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                        }`}
                      >
                        {isHighRisk ? 'High risk' : 'Medium risk'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate mt-0.5">
                      {student.gradeSubject && (
                        <>
                          <span>{student.gradeSubject}</span>
                          <span className="text-muted-foreground/40">·</span>
                        </>
                      )}
                      <span className="truncate">
                        {student.reason || 'Needs review'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score on right */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-foreground font-sans tabular-nums">
                    {student.avgScorePercent ?? 0}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Avg. score
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center py-7 px-4 my-auto">
          <div className="size-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="text-xs font-medium text-foreground">
            No students currently at risk
          </p>
          <p className="text-[11px] text-muted-foreground max-w-[220px] mt-1 leading-normal">
            All enrolled learners are meeting active engagement and attendance targets.
          </p>
        </div>
      )}
    </div>
  );
}
