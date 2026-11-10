import { useState } from 'react';
import { sessionStore } from '@/shared/store';
import { useOrganizationAnalyticsQuery } from '../../application';
import {
  AnalyticsHeader,
  AnalyticsKpiCards,
  LessonsCompletedChart,
  TeachingOperationsCard,
  TeacherPerformanceCard,
  StudentsNeedingAttentionCard,
  EnrollmentFunnelCard,
} from '../components';

export function AnalyticsPage() {
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;

  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const {
    data: analytics,
    isLoading,
    isFetching,
    refetch,
  } = useOrganizationAnalyticsQuery(organizationId, selectedDate);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 w-full">
      {/* Analytics Page Header with Title, Date Selector & Refresh */}
      <AnalyticsHeader
        currentSnapshotDate={analytics?.formattedSnapshotDate || ''}
        availableDates={analytics?.availableSnapshotDates || []}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      {isLoading && !analytics ? (
        <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-sm">
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Top 4 KPI Metric Cards */}
          <AnalyticsKpiCards
            totalActiveStudents={analytics?.totalActiveStudents ?? 0}
            activeLearnersTrend={analytics?.activeLearnersTrend ?? 0}
            activeLearnersSparkline={analytics?.activeLearnersSparkline ?? []}
            totalActiveTeachers={analytics?.totalActiveTeachers ?? 0}
            activeTeachersTrend={analytics?.activeTeachersTrend ?? 0}
            activeTeachersSparkline={analytics?.activeTeachersSparkline ?? []}
            totalLessonsThisMonth={analytics?.totalLessonsThisMonth ?? 0}
            totalLessonsLastMonth={analytics?.totalLessonsLastMonth ?? 0}
            lessonsTrend={analytics?.lessonsTrend ?? 0}
            lessonsSparkline={analytics?.lessonsSparkline ?? []}
            avgLessonCompletionRate={analytics?.avgLessonCompletionRate ?? 0}
            completionRateTrend={analytics?.completionRateTrend ?? 0}
            completionRateSparkline={analytics?.completionRateSparkline ?? []}
          />

          {/* Middle Row: Lessons Completed Chart (left) & Teaching Operations (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
            <div className="col-span-12 lg:col-span-8">
              <LessonsCompletedChart
                data={analytics?.weeklyCompletedLessons ?? []}
              />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <TeachingOperationsCard
                avgReportSubmissionTimeHours={
                  analytics?.avgReportSubmissionTimeHours ?? 0
                }
                avgReportSubmissionTrend={
                  analytics?.avgReportSubmissionTrend ?? 0
                }
                completionBreakdown={
                  analytics?.completionBreakdown ?? {
                    completedPercentage: 0,
                    inProgressPercentage: 0,
                    notStartedPercentage: 0,
                  }
                }
              />
            </div>
          </div>

          {/* Bottom Row: 3 Operational Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full pb-6">
            <TeacherPerformanceCard
              teachers={analytics?.teacherPerformance ?? []}
            />
            <StudentsNeedingAttentionCard
              students={analytics?.studentChurnRisk ?? []}
            />
            <EnrollmentFunnelCard
              stages={analytics?.funnelStages ?? []}
            />
          </div>
        </>
      )}
    </div>
  );
}
