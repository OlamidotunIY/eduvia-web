import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { createHashRouter, Navigate, Outlet } from "react-router-dom";

export const router = createHashRouter([
    {
        element: <Outlet />,
        children: [
            { path: '/', element: <Navigate to={APP_ROUTES.LOGIN} replace /> }
        ]
    }
])