import { api } from "./api";
import type { Lesson, LessonStatus } from "../types/lesson";

type LessonsResponse = {
  lessons: Lesson[];
};

type LessonResponse = {
  lesson: Lesson;
};

export type CreateLessonData = {
  title: string;
  status?: LessonStatus;
  videoUrl?: string;
};

export type UpdateLessonData = Partial<CreateLessonData>;

export async function listLessonsByCourse(courseId: string) {
  const response = await api.get<LessonsResponse>(`/courses/${courseId}/lessons`);

  return response.data.lessons;
}

export async function createLesson(courseId: string, data: CreateLessonData) {
  const response = await api.post<LessonResponse>(`/courses/${courseId}/lessons`, data);

  return response.data.lesson;
}

export async function updateLesson(id: string, data: UpdateLessonData) {
  const response = await api.patch<LessonResponse>(`/lessons/${id}`, data);

  return response.data.lesson;
}

export async function deleteLesson(id: string) {
  await api.delete(`/lessons/${id}`);
}
