import type { RouteObject } from "react-router-dom";
import { AuthGuard, RoleGuard } from "@/app/guard";
import { RoleLayout } from "@/app/shell";
import { DashboardPage, PlaceholderPage } from "@/features/dashboard";
import {
  CalendarPage,
  ClassroomDetailPage,
  ClassroomsPage,
} from "@/features/classroom";
import { SubjectsPage } from "@/features/subject";
import { AssessmentsPage } from "@/features/assessment";
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
      { path: APP_ROUTES.SUBJECTS, element: <SubjectsPage /> },
      { path: APP_ROUTES.ASSESSMENTS, element: <AssessmentsPage /> },
      { path: "*", element: <PlaceholderPage /> },
    ],
  },
];
