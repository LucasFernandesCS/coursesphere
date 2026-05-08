import { AppError } from "../errors/AppError";
import { CourseRepository } from "../repositories/course.repository";
import { LessonRepository } from "../repositories/lesson.repository";

type CreateLessonData = {
  title: string;
  status?: string;
  videoUrl?: string;
  courseId: string;
  userId: string;
};

type UpdateLessonData = {
  title?: string;
  status?: string;
  videoUrl?: string | null;
};

const allowedStatuses = ["draft", "published"];

export class LessonService {
  constructor(
    private readonly lessonRepository = new LessonRepository(),
    private readonly courseRepository = new CourseRepository()
  ) {}

  async create(data: CreateLessonData) {
    this.validateTitle(data.title);
    this.validateStatus(data.status ?? "draft");
    this.validateVideoUrl(data.videoUrl);

    const course = await this.courseRepository.findById(data.courseId);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (course.creatorId !== data.userId) {
      throw new AppError("You are not allowed to create lessons for this course", 403);
    }

    return this.lessonRepository.create({
      title: data.title,
      status: data.status ?? "draft",
      videoUrl: data.videoUrl,
      courseId: data.courseId,
    });
  }

  async listByCourse(courseId: string, userId: string) {
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const isCourseCreator = course.creatorId === userId;

    if (isCourseCreator) {
      return this.lessonRepository.findManyByCourseId(courseId);
    }

    return this.lessonRepository.findManyByCourseId(courseId, {
      status: "published",
    });
  }

  async getById(id: string) {
    const lesson = await this.lessonRepository.findById(id);

    if (!lesson) {
      throw new AppError("Lesson not found", 404);
    }

    return lesson;
  }

  async update(id: string, userId: string, data: UpdateLessonData) {
    const lesson = await this.getById(id);

    if (lesson.course.creatorId !== userId) {
      throw new AppError("You are not allowed to update this lesson", 403);
    }

    if (data.title !== undefined) {
      this.validateTitle(data.title);
    }

    if (data.status !== undefined) {
      this.validateStatus(data.status);
    }

    if (data.videoUrl !== undefined && data.videoUrl !== null) {
      this.validateVideoUrl(data.videoUrl);
    }

    return this.lessonRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    const lesson = await this.getById(id);

    if (lesson.course.creatorId !== userId) {
      throw new AppError("You are not allowed to delete this lesson", 403);
    }

    await this.lessonRepository.delete(id);
  }

  private validateTitle(title: string) {
    if (!title || title.trim().length < 3) {
      throw new AppError("Lesson title must have at least 3 characters", 400);
    }
  }

  private validateStatus(status: string) {
    if (!allowedStatuses.includes(status)) {
      throw new AppError("Lesson status must be draft or published", 400);
    }
  }

  private validateVideoUrl(videoUrl?: string) {
    if (!videoUrl) {
      return;
    }

    try {
      new URL(videoUrl);
    } catch {
      throw new AppError("Video URL must be valid", 400);
    }
  }
}
