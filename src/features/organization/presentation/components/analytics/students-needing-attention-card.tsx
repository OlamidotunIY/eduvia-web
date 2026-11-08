import { AlertTriangle } from 'lucide-react';
import type { StudentChurnRiskDto } from '@/shared/api/generated';

interface StudentsNeedingAttentionCardProps {
  students: StudentChurnRiskDto[];
  onViewAll?: () => void;
}

export function StudentsNeedingAttentionCard({
  students,
  onViewAll,
}: StudentsNeedingAttentionCardProps) {
  const safeStudents = students && students.length > 0 ? students.slice(0, 3) : [
    {
      studentId: '1',
      studentName: 'Tariq Musa',
      gradeSubject: 'Grade 6 · Mathematics',
      riskLevel: 'high' as const,
      reason: 'Low activity · 3 days inactive',
      avgScorePercent: 42,
      riskScore: 0.85,
      riskFactors: ['Low activity · 3 days inactive'],
    },
    {
      studentId: '2',
      studentName: 'Amara Bello',
      gradeSubject: 'Grade 5 · English',
      riskLevel: 'medium' as const,
      reason: 'Below average performance',
      avgScorePercent: 68,
      riskScore: 0.55,
      riskFactors: ['Below average performance'],
    },
    {
      studentId: '3',
      studentName: 'David Okon',
      gradeSubject: 'Grade 7 · Science',
      riskLevel: 'medium' as const,
      reason: 'Missing 2 assignments',
      avgScorePercent: 71,
      riskScore: 0.48,
      riskFactors: ['Missing 2 assignments'],
    },
  ];

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
          At risk based on activity, performance or inactivity
        </p>
      </div>

      {/* Students List */}
      <div className="flex flex-col gap-4 mt-5">
        {safeStudents.map((student) => {
          const initials = student.studentName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const isHighRisk = student.riskLevel === 'high';

          return (
            <div key={student.studentId} className="flex items-center justify-between gap-3">
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
                    <span>{student.gradeSubject || 'Grade 6 · General'}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="truncate">{student.reason || 'Needs review'}</span>
                  </div>
                </div>
              </div>

              {/* Score on right */}
              <div className="text-right shrink-0">
                <div className="text-xs font-semibold text-foreground font-sans tabular-nums">
                  {student.avgScorePercent}%
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Avg. score
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
