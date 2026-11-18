import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { UserSocketProvider } from "@/app/providers/user-socket-provider";
import { AuthSessionProvider } from "@/app/providers/auth-session-provider";
import { BoardSettingsProvider } from "@/app/providers/board-settings-provider";
import { router } from "@/app/router/route";
import { queryClient } from "@/shared/api";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthSessionProvider>
        <UserSocketProvider>
          <BoardSettingsProvider>
            <RouterProvider router={router} />
          </BoardSettingsProvider>
        </UserSocketProvider>
      </AuthSessionProvider>
    </ThemeProvider>
  </QueryClientProvider>,
);
