import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateQuestionInput,
  QuestionFilter,
  UpdateQuestionInput,
} from "../domain";
import { questionApi } from "../infrastructure";

export const questionsQueryKey = (
  organizationId: string,
  filter?: QuestionFilter,
) => ["organizations", organizationId, "questions", filter ?? {}] as const;

export const questionSummaryQueryKey = (organizationId: string) =>
  ["organizations", organizationId, "question-summary"] as const;

export const questionDetailQueryKey = (
  organizationId: string,
  questionId: string,
) => ["organizations", organizationId, "questions", "detail", questionId] as const;

export function useQuestionsQuery(
  organizationId: string | undefined,
  filter?: QuestionFilter,
) {
  return useQuery({
    queryKey: questionsQueryKey(organizationId ?? "", filter),
    queryFn: () => questionApi.search(organizationId!, filter),
    enabled: Boolean(organizationId),
  });
}

export function useQuestionSummaryQuery(organizationId: string | undefined) {
  return useQuery({
    queryKey: questionSummaryQueryKey(organizationId ?? ""),
    queryFn: () => questionApi.getSummary(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useQuestionDetailQuery(
  organizationId: string | undefined,
  questionId: string | null,
) {
  return useQuery({
    queryKey: questionDetailQueryKey(organizationId ?? "", questionId ?? ""),
    queryFn: () => questionApi.getById(organizationId!, questionId!),
    enabled: Boolean(organizationId && questionId),
  });
}

export function useCreateQuestionMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuestionInput) => {
      if (!organizationId) throw new Error("Organization context is required");
      return questionApi.create(organizationId, input);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["organizations", organizationId, "questions"],
        });
        queryClient.invalidateQueries({
          queryKey: questionSummaryQueryKey(organizationId),
        });
      }
    },
  });
}

export function useUpdateQuestionMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      input,
    }: {
      questionId: string;
      input: UpdateQuestionInput;
    }) => {
      if (!organizationId) throw new Error("Organization context is required");
      return questionApi.update(organizationId, questionId, input);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["organizations", organizationId, "questions"],
        });
      }
    },
  });
}

export function usePublishQuestionMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => {
      if (!organizationId) throw new Error("Organization context is required");
      return questionApi.publish(organizationId, questionId);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["organizations", organizationId, "questions"],
        });
        queryClient.invalidateQueries({
          queryKey: questionSummaryQueryKey(organizationId),
        });
      }
    },
  });
}

export function useUnpublishQuestionMutation(
  organizationId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => {
      if (!organizationId) throw new Error("Organization context is required");
      return questionApi.unpublish(organizationId, questionId);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["organizations", organizationId, "questions"],
        });
        queryClient.invalidateQueries({
          queryKey: questionSummaryQueryKey(organizationId),
        });
      }
    },
  });
}

export function useDeleteQuestionMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => {
      if (!organizationId) throw new Error("Organization context is required");
      return questionApi.delete(organizationId, questionId);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["organizations", organizationId, "questions"],
        });
        queryClient.invalidateQueries({
          queryKey: questionSummaryQueryKey(organizationId),
        });
      }
    },
  });
}
