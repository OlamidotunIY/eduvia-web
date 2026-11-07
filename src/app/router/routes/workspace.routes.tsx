import type { RouteObject } from "react-router-dom";
import { AuthGuard, RoleGuard } from "@/app/guard";
import { RoleLayout } from "@/app/shell";
import { DashboardPage, PlaceholderPage } from "@/features/dashboard";
import {
  CalendarPage,
  ClassroomDetailPage,
  ClassroomsPage,
} from "@/features/classroom";
import {
  CurriculumDetailPage,
  CurriculumPage,
} from "@/features/curriculum";
import { SubjectsPage } from "@/features/subject";
import { AssessmentsPage } from "@/features/assessment";
import { QuestionDetailPage, QuestionsPage } from "@/features/question";
import { MessagesPage } from "@/features/messages";
import { APP_ROUTES } from "@/shared/constant/routes.constants";

export const workspaceRoutes: RouteObject[] = [
  {
    element: (
      <AuthGuard>
        <RoleGuard>
          <RoleLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { path: APP_ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: APP_ROUTES.CLASSROOMS, element: <ClassroomsPage /> },
      {
        path: `${APP_ROUTES.CLASSROOMS}/:classroomId`,
        element: <ClassroomDetailPage />,
      },
      { path: APP_ROUTES.CALENDAR, element: <CalendarPage /> },
      { path: APP_ROUTES.CURRICULUM, element: <CurriculumPage /> },
      {
        path: `${APP_ROUTES.CURRICULUM}/:curriculumId`,
        element: <CurriculumDetailPage />,
      },
      { path: APP_ROUTES.SUBJECTS, element: <SubjectsPage /> },
      { path: APP_ROUTES.ASSESSMENTS, element: <AssessmentsPage /> },
      { path: APP_ROUTES.QUESTIONS, element: <QuestionsPage /> },
      {
        path: `${APP_ROUTES.QUESTIONS}/:questionId`,
        element: <QuestionDetailPage />,
      },
      { path: APP_ROUTES.MESSAGES, element: <MessagesPage /> },
      { path: "*", element: <PlaceholderPage /> },
    ],
  },
];
