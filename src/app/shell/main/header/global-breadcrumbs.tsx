import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export function GlobalBreadcrumbs() {
  const { pathname } = useLocation();

  const segments = useMemo<BreadcrumbSegment[]>(() => {
    // 1. Dashboard
    if (pathname === APP_ROUTES.DASHBOARD || pathname === "/") {
      return [{ label: "Dashboard" }];
    }

    // 2. Classrooms
    if (pathname === APP_ROUTES.CLASSROOMS) {
      return [{ label: "Classrooms" }];
    }
    if (pathname.startsWith(`${APP_ROUTES.CLASSROOMS}/`)) {
      return [
        { label: "Classrooms", href: APP_ROUTES.CLASSROOMS },
        { label: "Classroom Details" },
      ];
    }

    // 3. Calendar
    if (pathname === APP_ROUTES.CALENDAR) {
      return [{ label: "Calendar" }];
    }

    // 4. Curriculum
    if (pathname === APP_ROUTES.CURRICULUM) {
      return [{ label: "Curriculum" }];
    }
    if (pathname.startsWith(`${APP_ROUTES.CURRICULUM}/`)) {
      return [
        { label: "Curriculum", href: APP_ROUTES.CURRICULUM },
        { label: "Curriculum Details" },
      ];
    }

    // 5. Organization Sections
    if (pathname === APP_ROUTES.MEMBERS) {
      return [
        { label: "Organization", href: APP_ROUTES.MEMBERS },
        { label: "Team & Members" },
      ];
    }
    if (pathname === APP_ROUTES.ROLES) {
      return [
        { label: "Organization", href: APP_ROUTES.MEMBERS },
        { label: "Roles & Permissions" },
      ];
    }
    if (pathname === APP_ROUTES.ANALYTICS) {
      return [
        { label: "Organization", href: APP_ROUTES.MEMBERS },
        { label: "Analytics" },
      ];
    }
    if (pathname === APP_ROUTES.STUDENT_PROGRESS) {
      return [
        { label: "Learners", href: APP_ROUTES.STUDENT_PROGRESS },
        { label: "Student Progress" },
      ];
    }
    if (pathname.startsWith(`${APP_ROUTES.STUDENT_PROGRESS}/`)) {
      return [
        { label: "Learners", href: APP_ROUTES.STUDENT_PROGRESS },
        { label: "Student Progress", href: APP_ROUTES.STUDENT_PROGRESS },
        { label: "Learner Profile" },
      ];
    }
    if (pathname === APP_ROUTES.SUBJECTS) {
      return [
        { label: "Organization", href: APP_ROUTES.MEMBERS },
        { label: "Subjects" },
      ];
    }

    // 6. Assessments & Lesson Reports
    if (pathname === APP_ROUTES.ASSESSMENTS) {
      return [{ label: "Assessments" }];
    }
    if (pathname === APP_ROUTES.LESSON_REPORTS) {
      return [
        { label: "Teaching" },
        { label: "Lesson Reports" },
      ];
    }
    if (pathname.startsWith(`${APP_ROUTES.LESSON_REPORTS}/`)) {
      return [
        { label: "Teaching" },
        { label: "Lesson Reports", href: APP_ROUTES.LESSON_REPORTS },
        { label: "Report Details" },
      ];
    }

    // 7. Question Bank
    if (pathname === APP_ROUTES.QUESTIONS) {
      return [{ label: "Question Bank" }];
    }
    if (pathname.startsWith(`${APP_ROUTES.QUESTIONS}/`)) {
      return [
        { label: "Question Bank", href: APP_ROUTES.QUESTIONS },
        { label: "Question Details" },
      ];
    }

    // 8. Messages
    if (pathname.startsWith(APP_ROUTES.MESSAGES)) {
      return [{ label: "Messages" }];
    }

    // 9. Notifications
    if (pathname.startsWith(APP_ROUTES.NOTIFICATIONS)) {
      return [{ label: "Notifications" }];
    }

    // Fallback: capitalize route segments
    const cleanParts = pathname
      .split("/")
      .filter(Boolean)
      .map((part) =>
        part
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      );

    if (cleanParts.length === 0) {
      return [{ label: "Dashboard" }];
    }

    return cleanParts.map((label, idx) => {
      const isLast = idx === cleanParts.length - 1;
      return {
        label,
        href: isLast ? undefined : `/${pathname.split("/").filter(Boolean).slice(0, idx + 1).join("/")}`,
      };
    });
  }, [pathname]);

  return (
    <Breadcrumb className="select-none">
      <BreadcrumbList>
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;

          return (
            <div key={`${seg.label}-${idx}`} className="flex items-center gap-1.5 sm:gap-2">
              <BreadcrumbItem>
                {isLast || !seg.href ? (
                  <BreadcrumbPage className="font-semibold text-foreground text-xs sm:text-sm">
                    {seg.label}
                  </BreadcrumbPage>
                ) : (
                  <Link
                    to={seg.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {seg.label}
                  </Link>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
