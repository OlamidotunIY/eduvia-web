export const APP_ROUTES = {
  LOGIN: "/login",
  REGISTRATION: "/register",
  AUTH_CALLBACK: "/auth/callback",
  CALLBACK: "/callback",
  TWO_FACTOR_AUTH: "/auth/2fa",
  VERIFY_EMAIL: "/auth/verify-email",
  SETUP_PASSWORD: "/auth/setup-password",
  ONBOARDING: "/onboarding",
  ONBOARDING_ORGANIZATION: "/onboarding/organization",
  ONBOARDING_MARKETPLACE: "/onboarding/marketplace",

  DASHBOARD: "/dashboard",
  CLASSROOMS: "/classrooms",
  CALENDAR: "/calendar",
  CURRICULUM: "/curriculum",
  SUBJECTS: "/organization/subjects",
  MEMBERS: "/organization/members",
  ROLES: "/organization/roles",
  ANALYTICS: "/organization/analytics",
  STUDENT_PROGRESS: "/student-progress",
  LESSON_REPORTS: "/lesson-reports",
  ASSESSMENTS: "/assessments",
  QUESTIONS: "/questions",
  MESSAGES: "/messages",
  NOTIFICATIONS: "/notifications",
} as const;

export function classroomRoute(classroomId: string): string {
  return `${APP_ROUTES.CLASSROOMS}/${classroomId}`;
}

export function curriculumDetailRoute(curriculumId: string): string {
  return `${APP_ROUTES.CURRICULUM}/${curriculumId}`;
}

export function questionRoute(questionId: string): string {
  return `${APP_ROUTES.QUESTIONS}/${questionId}`;
}

export function studentProgressRoute(studentId: string): string {
  return `${APP_ROUTES.STUDENT_PROGRESS}/${studentId}`;
}

export function lessonReportRoute(reportId: string): string {
  return `${APP_ROUTES.LESSON_REPORTS}/${reportId}`;
}

export const ADMIN_ROUTES = {
  LOGIN: "/admin/login",
  DASHBOARD: "/admin/dashboard",
  SETTINGS: "/admin/settings",
} as const;
