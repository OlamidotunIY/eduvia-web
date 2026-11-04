import { useQuery } from "@tanstack/react-query";
import { subjectRepository } from "../../infrastructure";

export const organizationSubjectsKey = (organizationId: string) =>
  ["organizations", organizationId, "subjects"] as const;

export const platformSubjectsKey = ["platform-subjects"] as const;

export function useOrganizationSubjectsQuery(
  organizationId: string | undefined,
) {
  return useQuery({
    queryKey: organizationSubjectsKey(organizationId ?? ""),
    queryFn: () => subjectRepository.listOrganizationSubjects(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function usePlatformSubjectsQuery(enabled = true) {
  return useQuery({
    queryKey: platformSubjectsKey,
    queryFn: () => subjectRepository.listPlatformSubjects(),
    enabled,
  });
}
