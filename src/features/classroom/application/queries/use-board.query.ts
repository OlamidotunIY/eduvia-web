import { useQuery } from "@tanstack/react-query";
import { lessonBoardRepository } from "../../infrastructure";

export const boardByLessonQueryKey = (lessonId: string) =>
  ["boards", "by-lesson", lessonId] as const;

export const boardQuestionResponsesQueryKey = (
  boardId: string,
  boardQuestionId: string,
) => ["boards", boardId, "questions", boardQuestionId, "responses"] as const;

export const myBoardResponseQueryKey = (
  boardId: string,
  boardQuestionId: string,
) => ["boards", boardId, "questions", boardQuestionId, "responses", "me"] as const;

export function useBoardByLessonQuery(lessonId: string | undefined) {
  return useQuery({
    queryKey: boardByLessonQueryKey(lessonId ?? ""),
    queryFn: () => lessonBoardRepository.getByLesson(lessonId!),
    enabled: Boolean(lessonId),
  });
}

export function useBoardQuestionResponsesQuery(
  boardId: string | undefined,
  boardQuestionId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: boardQuestionResponsesQueryKey(
      boardId ?? "",
      boardQuestionId ?? "",
    ),
    queryFn: () =>
      lessonBoardRepository.listResponses(boardId!, boardQuestionId!),
    enabled: Boolean(enabled && boardId && boardQuestionId),
  });
}

export function useMyBoardResponseQuery(
  boardId: string | undefined,
  boardQuestionId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: myBoardResponseQueryKey(boardId ?? "", boardQuestionId ?? ""),
    queryFn: () =>
      lessonBoardRepository.getMyResponse(boardId!, boardQuestionId!),
    enabled: Boolean(enabled && boardId && boardQuestionId),
  });
}
