import type { RouteObject } from "react-router-dom";
import { AuthGuard, RoleGuard } from "@/app/guard";
import { RoleLayout } from "@/app/shell";
import { DashboardPage, PlaceholderPage } from "@/features/dashboard";
import { ClassroomsPage } from "@/features/classroom";
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
      { path: "*", element: <PlaceholderPage /> },
    ],
  },
];
