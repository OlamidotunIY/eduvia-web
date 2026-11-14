import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BoardMode, BoardSectionType } from "@/shared/domain";
import { lessonBoardApi, lessonBoardRepository } from "../../infrastructure";
import {
  boardByLessonQueryKey,
  boardQuestionResponsesQueryKey,
  myBoardResponseQueryKey,
} from "../queries/use-board.query";

function useInvalidateBoard(lessonId: string | undefined) {
  const queryClient = useQueryClient();
  return () => {
    if (!lessonId) return Promise.resolve();
    return queryClient.invalidateQueries({
      queryKey: boardByLessonQueryKey(lessonId),
    });
  };
}

export function useSaveBoardPlanMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: (input: {
      learningObjectives?: string[];
      topicsCovered?: string[];
      teachingNotes?: string | null;
      homeworkDescription?: string | null;
    }) => lessonBoardApi.savePlan(organizationId!, boardId!, input),
    onSuccess: invalidate,
  });
}

export function useCompleteBoardPlanMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: () => lessonBoardApi.completePlan(organizationId!, boardId!),
    onSuccess: invalidate,
  });
}

export function useSwitchBoardModeMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: (input: { mode: BoardMode; lessonStatus?: string }) =>
      lessonBoardApi.switchMode(organizationId!, boardId!, input),
    onSuccess: invalidate,
  });
}

export function useToggleBoardLockMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: (lock: boolean) =>
      lock
        ? lessonBoardApi.lock(organizationId!, boardId!)
        : lessonBoardApi.unlock(organizationId!, boardId!),
    onSuccess: invalidate,
  });
}

export function useImportBoardContentMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: (sourceBoardId: string) =>
      lessonBoardApi.importContent(organizationId!, boardId!, sourceBoardId),
    onSuccess: invalidate,
  });
}

export function useAddBoardSectionMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: (input: {
      type: BoardSectionType;
      content: string;
      position?: number;
      isTeacherOnly?: boolean;
    }) => lessonBoardApi.addSection(organizationId!, boardId!, input),
    onSuccess: invalidate,
  });
}

export function useUpdateBoardSectionMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: (input: { sectionId: string; content: string }) =>
      lessonBoardApi.updateSection(
        organizationId!,
        boardId!,
        input.sectionId,
        input.content,
      ),
    onSuccess: invalidate,
  });
}

export function useRemoveBoardSectionMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: (sectionId: string) =>
      lessonBoardApi.removeSection(organizationId!, boardId!, sectionId),
    onSuccess: invalidate,
  });
}

export function useUploadBoardMaterialMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: async (input: { file: File; isTeacherOnly?: boolean }) => {
      const fileUrl = await lessonBoardRepository.uploadFile(
        boardId!,
        input.file,
      );
      const isImage = input.file.type.startsWith("image/") ||
        /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(input.file.name);
      return lessonBoardApi.addSection(organizationId!, boardId!, {
        type: isImage ? "image" : "text",
        content: isImage ? fileUrl : `${input.file.name}\n${fileUrl}`,
        isTeacherOnly: input.isTeacherOnly,
      });
    },
    onSuccess: invalidate,
  });
}

export function useAttachBoardQuestionMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: (input: {
      questionId: string;
      mode?: "classwork" | "assignment";
      maxMarks: number;
      showOptions?: boolean;
      dueAt?: string;
    }) => lessonBoardApi.attachQuestion(organizationId!, boardId!, input),
    onSuccess: invalidate,
  });
}

export function useRemoveBoardQuestionMutation(
  organizationId: string | undefined,
  boardId: string | undefined,
  lessonId: string | undefined,
) {
  const invalidate = useInvalidateBoard(lessonId);
  return useMutation({
    mutationFn: (boardQuestionId: string) =>
      lessonBoardApi.removeQuestion(organizationId!, boardId!, boardQuestionId),
    onSuccess: invalidate,
  });
}

export function useSubmitBoardResponseMutation(boardId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      boardQuestionId: string;
      responseType: "text" | "image" | "mcq";
      textContent?: string;
      selectedOption?: string;
      imageUrl?: string;
      file?: File;
    }) => {
      let resolvedImageUrl = input.imageUrl;
      if (input.file) {
        resolvedImageUrl = await lessonBoardRepository.uploadFile(
          boardId!,
          input.file,
        );
      }
      return lessonBoardApi.submitResponse(boardId!, input.boardQuestionId, {
        responseType: input.responseType,
        textContent: input.textContent,
        selectedOption: input.selectedOption,
        imageUrl: resolvedImageUrl,
      });
    },
    onSuccess: async (_data, variables) => {
      if (!boardId) return;
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: myBoardResponseQueryKey(boardId, variables.boardQuestionId),
        }),
        queryClient.invalidateQueries({
          queryKey: boardQuestionResponsesQueryKey(
            boardId,
            variables.boardQuestionId,
          ),
        }),
      ]);
    },
  });
}

export function useMarkBoardResponseMutation(boardId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      boardQuestionId: string;
      responseId: string;
      marksAwarded: number;
      maxMarks: number;
      feedback?: string;
    }) =>
      lessonBoardApi.markResponse(
        boardId!,
        input.boardQuestionId,
        input.responseId,
        {
          marksAwarded: input.marksAwarded,
          maxMarks: input.maxMarks,
          feedback: input.feedback,
        },
      ),
    onSuccess: async (_data, variables) => {
      if (!boardId) return;
      await queryClient.invalidateQueries({
        queryKey: boardQuestionResponsesQueryKey(
          boardId,
          variables.boardQuestionId,
        ),
      });
    },
  });
}
