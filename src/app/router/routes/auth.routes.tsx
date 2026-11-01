import { LoginPage } from "@/features/authentication/presentation/pages/login.page"
import { APP_ROUTES } from "@/shared/constant/routes.constants"
import type { RouteObject } from "react-router-dom"

export const authRoutes: RouteObject[] = [
    {
        path: APP_ROUTES.LOGIN, element: <LoginPage />,
    }
]