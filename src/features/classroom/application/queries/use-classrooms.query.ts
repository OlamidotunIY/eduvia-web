import { useQuery } from "@tanstack/react-query";
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
) => [...classroomDetailQueryKey(organizationId, classroomId), "students"] as const;
export const classroomLessonsQueryKey = (
  organizationId: string,
  classroomId: string,
) => [...classroomDetailQueryKey(organizationId, classroomId), "lessons"] as const;

export function useClassroomsQuery(organizationId: string | undefined) {
  return useQuery({
    queryKey: classroomsQueryKey(organizationId ?? ""),
    queryFn: () => classroomRepository.list(organizationId!),
    enabled: Boolean(organizationId),
  });
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
    queryKey: classroomStudentsQueryKey(organizationId ?? "", classroomId ?? ""),
    queryFn: () => classroomRepository.listStudents(organizationId!, classroomId!),
    enabled: Boolean(organizationId && classroomId),
  });
}

export function useClassroomLessonsQuery(
  organizationId: string | undefined,
  classroomId: string | undefined,
) {
  return useQuery({
    queryKey: classroomLessonsQueryKey(organizationId ?? "", classroomId ?? ""),
    queryFn: () => classroomRepository.listLessons(organizationId!, classroomId!),
    enabled: Boolean(organizationId && classroomId),
  });
}
