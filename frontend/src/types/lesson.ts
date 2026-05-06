export type LessonStatus = "draft" | "published";

export type Lesson = {
  id: string;
  title: string;
  status: LessonStatus;
  videoUrl?: string | null;
  courseId: string;
  createdAt: string;
  updatedAt: string;
};
