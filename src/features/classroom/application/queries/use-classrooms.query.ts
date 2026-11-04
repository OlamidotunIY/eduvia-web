import { useQuery } from "@tanstack/react-query";
import { classroomRepository } from "../../infrastructure";

export const classroomsQueryKey = (organizationId: string) =>
  ["organizations", organizationId, "classrooms"] as const;
export const organizationSubjectsQueryKey = (organizationId: string) =>
  ["organizations", organizationId, "subjects"] as const;

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
