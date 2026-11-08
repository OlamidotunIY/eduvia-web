import type {
  OrgAnalyticsResponseDto,
  WeeklyLessonComparisonDto,
  TeacherPerformanceDto,
  StudentChurnRiskDto,
  FunnelStageDto,
  LessonCompletionBreakdownDto,
} from '@/shared/api/generated';

export interface OrgAnalyticsProps {
  id: string;
  orgId: string;
  snapshotDate: string;
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
  avgReportSubmissionTimeHours: number;
  avgReportSubmissionTrend: number;
  completionBreakdown: LessonCompletionBreakdownDto;
  weeklyCompletedLessons: WeeklyLessonComparisonDto[];
  teacherPerformance: TeacherPerformanceDto[];
  studentChurnRisk: StudentChurnRiskDto[];
  funnelStages: FunnelStageDto[];
  availableSnapshotDates: string[];
  createdAt: string;
  updatedAt: string;
}

export class OrgAnalyticsEntity {
  readonly id: string;
  readonly orgId: string;
  readonly snapshotDate: string;
  readonly totalActiveStudents: number;
  readonly activeLearnersTrend: number;
  readonly activeLearnersSparkline: number[];
  readonly totalActiveTeachers: number;
  readonly activeTeachersTrend: number;
  readonly activeTeachersSparkline: number[];
  readonly totalLessonsThisMonth: number;
  readonly totalLessonsLastMonth: number;
  readonly lessonsTrend: number;
  readonly lessonsSparkline: number[];
  readonly avgLessonCompletionRate: number;
  readonly completionRateTrend: number;
  readonly completionRateSparkline: number[];
  readonly avgReportSubmissionTimeHours: number;
  readonly avgReportSubmissionTrend: number;
  readonly completionBreakdown: LessonCompletionBreakdownDto;
  readonly weeklyCompletedLessons: WeeklyLessonComparisonDto[];
  readonly teacherPerformance: TeacherPerformanceDto[];
  readonly studentChurnRisk: StudentChurnRiskDto[];
  readonly funnelStages: FunnelStageDto[];
  readonly availableSnapshotDates: string[];
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(props: OrgAnalyticsProps) {
    this.id = props.id;
    this.orgId = props.orgId;
    this.snapshotDate = props.snapshotDate;
    this.totalActiveStudents = props.totalActiveStudents;
    this.activeLearnersTrend = props.activeLearnersTrend;
    this.activeLearnersSparkline = props.activeLearnersSparkline;
    this.totalActiveTeachers = props.totalActiveTeachers;
    this.activeTeachersTrend = props.activeTeachersTrend;
    this.activeTeachersSparkline = props.activeTeachersSparkline;
    this.totalLessonsThisMonth = props.totalLessonsThisMonth;
    this.totalLessonsLastMonth = props.totalLessonsLastMonth;
    this.lessonsTrend = props.lessonsTrend;
    this.lessonsSparkline = props.lessonsSparkline;
    this.avgLessonCompletionRate = props.avgLessonCompletionRate;
    this.completionRateTrend = props.completionRateTrend;
    this.completionRateSparkline = props.completionRateSparkline;
    this.avgReportSubmissionTimeHours = props.avgReportSubmissionTimeHours;
    this.avgReportSubmissionTrend = props.avgReportSubmissionTrend;
    this.completionBreakdown = props.completionBreakdown;
    this.weeklyCompletedLessons = props.weeklyCompletedLessons;
    this.teacherPerformance = props.teacherPerformance;
    this.studentChurnRisk = props.studentChurnRisk;
    this.funnelStages = props.funnelStages;
    this.availableSnapshotDates = props.availableSnapshotDates;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get formattedSnapshotDate(): string {
    if (!this.snapshotDate) return '';
    try {
      const date = new Date(this.snapshotDate);
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return this.snapshotDate;
    }
  }

  get formattedSubmissionTime(): string {
    return `${this.avgReportSubmissionTimeHours.toFixed(1)} hrs`;
  }

  get formattedCompletionRate(): string {
    return `${this.avgLessonCompletionRate.toFixed(1)}%`;
  }

  static fromDto(dto: OrgAnalyticsResponseDto): OrgAnalyticsEntity {
    return new OrgAnalyticsEntity({
      id: dto.id,
      orgId: dto.orgId,
      snapshotDate: dto.snapshotDate,
      totalActiveStudents: dto.totalActiveStudents,
      activeLearnersTrend: dto.activeLearnersTrend,
      activeLearnersSparkline: dto.activeLearnersSparkline ?? [],
      totalActiveTeachers: dto.totalActiveTeachers,
      activeTeachersTrend: dto.activeTeachersTrend,
      activeTeachersSparkline: dto.activeTeachersSparkline ?? [],
      totalLessonsThisMonth: dto.totalLessonsThisMonth,
      totalLessonsLastMonth: dto.totalLessonsLastMonth,
      lessonsTrend: dto.lessonsTrend,
      lessonsSparkline: dto.lessonsSparkline ?? [],
      avgLessonCompletionRate: dto.avgLessonCompletionRate,
      completionRateTrend: dto.completionRateTrend,
      completionRateSparkline: dto.completionRateSparkline ?? [],
      avgReportSubmissionTimeHours: dto.avgReportSubmissionTimeHours,
      avgReportSubmissionTrend: dto.avgReportSubmissionTrend,
      completionBreakdown: dto.completionBreakdown ?? {
        completedPercentage: 92.4,
        inProgressPercentage: 5.1,
        notStartedPercentage: 2.5,
      },
      weeklyCompletedLessons: dto.weeklyCompletedLessons ?? [],
      teacherPerformance: dto.teacherPerformance ?? [],
      studentChurnRisk: dto.studentChurnRisk ?? [],
      funnelStages: dto.funnelStages ?? [],
      availableSnapshotDates: dto.availableSnapshotDates ?? [],
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}
