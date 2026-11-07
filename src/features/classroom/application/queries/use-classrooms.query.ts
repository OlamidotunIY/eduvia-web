import { useQueries, useQuery } from "@tanstack/react-query";
import type { Classroom } from "@/shared/domain";
import { classroomRepository } from "../../infrastructure";

export const classroomsQueryKey = (organizationId: string) =>
  ["organizations", organizationId, "classrooms"] as const;
export const organizationSubjectsQueryKey = (organizationId: string) =>
  ["organizations", organizationId, "subjects"] as const;
export const classroomDetailQueryKey = (
  organizationId: string,
  classroomId: string,
) => ["organizations", organizationId, "classrooms", classroomId] as const;
export const classroomStudentsQueryKey = (
  organizationId: string,
  classroomId: string,
) =>
  [
    ...classroomDetailQueryKey(organizationId, classroomId),
    "students",
  ] as const;
export const classroomLessonsQueryKey = (
  organizationId: string,
  classroomId: string,
  range?: { fromDate?: string; toDate?: string },
) =>
  [
    ...classroomDetailQueryKey(organizationId, classroomId),
    "lessons",
    range?.fromDate ?? "current-week",
    range?.toDate ?? "current-week",
  ] as const;
export const organizationCalendarLessonsQueryKey = (
  organizationId: string,
  range: { fromDate: string; toDate: string },
) =>
  [
    "organizations",
    organizationId,
    "calendar-lessons",
    range.fromDate,
    range.toDate,
  ] as const;

export function useClassroomsQuery(organizationId: string | undefined) {
  return useQuery({
    queryKey: classroomsQueryKey(organizationId ?? ""),
    queryFn: () => classroomRepository.list(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useClassroomEnrollmentCounts(
  organizationId: string | undefined,
  classrooms: Classroom[],
) {
  const results = useQueries({
    queries: classrooms.map((classroom) => ({
      queryKey: classroomStudentsQueryKey(organizationId ?? "", classroom.id),
      queryFn: () => classroomRepository.listStudents(organizationId!, classroom.id),
      enabled: Boolean(organizationId),
      staleTime: 30_000,
    })),
  });

  return new Map(
    classrooms.map((classroom, index) => [
      classroom.id,
      results[index]?.data?.filter((student) => student.status === "active")
        .length ?? 0,
    ]),
  );
}

export function useOrganizationSubjectsQuery(
  organizationId: string | undefined,
) {
  return useQuery({
    queryKey: organizationSubjectsQueryKey(organizationId ?? ""),
    queryFn: () => classroomRepository.listSubjects(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useClassroomDetailQuery(
  organizationId: string | undefined,
  classroomId: string | undefined,
) {
  return useQuery({
    queryKey: classroomDetailQueryKey(organizationId ?? "", classroomId ?? ""),
    queryFn: () => classroomRepository.get(organizationId!, classroomId!),
    enabled: Boolean(organizationId && classroomId),
  });
}

export function useClassroomStudentsQuery(
  organizationId: string | undefined,
  classroomId: string | undefined,
) {
  return useQuery({
    queryKey: classroomStudentsQueryKey(
      organizationId ?? "",
      classroomId ?? "",
    ),
    queryFn: () =>
      classroomRepository.listStudents(organizationId!, classroomId!),
    enabled: Boolean(organizationId && classroomId),
  });
}

export function useClassroomLessonsQuery(
  organizationId: string | undefined,
  classroomId: string | undefined,
  range?: { fromDate?: string; toDate?: string },
) {
  return useQuery({
    queryKey: classroomLessonsQueryKey(
      organizationId ?? "",
      classroomId ?? "",
      range,
    ),
    queryFn: () =>
      classroomRepository.listLessons(organizationId!, classroomId!, range),
    enabled: Boolean(organizationId && classroomId),
  });
}

export function useOrganizationCalendarLessonsQuery(
  organizationId: string | undefined,
  range: { fromDate: string; toDate: string },
) {
  return useQuery({
    queryKey: organizationCalendarLessonsQueryKey(organizationId ?? "", range),
    queryFn: () =>
      classroomRepository.listOrganizationLessons(organizationId!, range),
    enabled: Boolean(organizationId),
  });
}

export function useLearnerCandidatesQuery(
  organizationId: string | undefined,
  classroomId: string | undefined,
) {
  return useQuery({
    queryKey: [
      ...classroomDetailQueryKey(organizationId ?? "", classroomId ?? ""),
      "learner-candidates",
    ],
    queryFn: () =>
      classroomRepository.listLearnerCandidates(organizationId!, classroomId!),
    enabled: Boolean(organizationId && classroomId),
  });
}
