import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCurriculumInput,
  CurriculumListFilter,
} from "@/shared/domain";
import { curriculumRepository } from "../../infrastructure";

export const allCurriculaQueryKey = (filter?: CurriculumListFilter) =>
  [
    "curricula",
    filter?.countryCode ?? "all-countries",
    filter?.isActive !== undefined ? String(filter.isActive) : "all-status",
  ] as const;

export const curriculumOverviewQueryKey = (organizationId: string) =>
  ["organizations", organizationId, "curriculum", "overview"] as const;

export const curriculumTreeQueryKey = (
  organizationId: string,
  curriculumId: string,
  preview?: boolean,
) =>
  [
    "organizations",
    organizationId,
    "curriculum",
    "tree",
    curriculumId,
    preview ? "preview" : "scoped",
  ] as const;

export const curriculumSearchQueryKey = (
  organizationId: string,
  query: string,
  curriculumId?: string,
) =>
  [
    "organizations",
    organizationId,
    "curriculum",
    "search",
    curriculumId ?? "all",
    query,
  ] as const;

export function useAllCurriculaQuery(filter?: CurriculumListFilter) {
  return useQuery({
    queryKey: allCurriculaQueryKey(filter),
    queryFn: () => curriculumRepository.listAll(filter),
  });
}

export function useCurriculumOverviewQuery(organizationId?: string) {
  return useQuery({
    queryKey: curriculumOverviewQueryKey(organizationId ?? ""),
    queryFn: () => curriculumRepository.getOverview(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useCurriculumTreeQuery(
  organizationId?: string,
  curriculumId?: string,
  preview?: boolean,
) {
  return useQuery({
    queryKey: organizationId
      ? curriculumTreeQueryKey(
          organizationId,
          curriculumId ?? "",
          preview,
        )
      : (["curricula", curriculumId ?? "", "tree"] as const),
    queryFn: () => {
      if (organizationId && curriculumId) {
        return curriculumRepository.getTree(organizationId, curriculumId, preview);
      }
      return curriculumRepository.getTreeDirect(curriculumId!);
    },
    enabled: Boolean(curriculumId),
  });
}

export function useCurriculumSearchQuery(
  organizationId?: string,
  query?: string,
  curriculumId?: string,
) {
  const trimmed = query?.trim() ?? "";
  return useQuery({
    queryKey: curriculumSearchQueryKey(organizationId ?? "", trimmed, curriculumId),
    queryFn: () =>
      curriculumRepository.search(organizationId!, trimmed, curriculumId),
    enabled: Boolean(organizationId && trimmed.length >= 2),
  });
}

export function useCurriculumDetailQuery(curriculumId?: string) {
  return useQuery({
    queryKey: ["curricula", "detail", curriculumId ?? ""] as const,
    queryFn: () => curriculumRepository.getById(curriculumId!),
    enabled: Boolean(curriculumId),
  });
}

export function useUpdateCurriculumMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCurriculumInput>;
    }) => curriculumRepository.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["curricula"] });
      queryClient.invalidateQueries({
        queryKey: ["curricula", "detail", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useCreateCurriculumNodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      curriculumId,
      data,
    }: {
      curriculumId: string;
      data: any;
    }) => curriculumRepository.createNode(curriculumId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({
        queryKey: ["curricula", "detail", variables.curriculumId],
      });
      queryClient.invalidateQueries({ queryKey: ["curricula"] });
    },
  });
}

export function useUpdateCurriculumNodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nodeId,
      curriculumId: _curriculumId,
      data,
    }: {
      nodeId: string;
      curriculumId: string;
      data: any;
    }) => curriculumRepository.updateNode(nodeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({
        queryKey: ["curricula", "detail", variables.curriculumId],
      });
      queryClient.invalidateQueries({ queryKey: ["curricula"] });
    },
  });
}

export function useDeactivateCurriculumNodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nodeId,
      curriculumId: _curriculumId,
    }: {
      nodeId: string;
      curriculumId: string;
    }) => curriculumRepository.deactivateNode(nodeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({
        queryKey: ["curricula", "detail", variables.curriculumId],
      });
      queryClient.invalidateQueries({ queryKey: ["curricula"] });
    },
  });
}

export function useCreateCurriculumMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCurriculumInput) => curriculumRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curricula"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useToggleCurriculumActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (isActive) {
        await curriculumRepository.deactivate(id);
      } else {
        await curriculumRepository.activate(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curricula"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}
