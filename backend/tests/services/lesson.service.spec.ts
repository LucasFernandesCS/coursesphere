import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import { LessonService } from "../../src/services/lesson.service";
import { CourseService } from "../../src/services/course.service";
import { UserRepository } from "../../src/repositories/user.repository";
import { AppError } from "../../src/errors/AppError";

describe("LessonService", () => {
  async function createUser() {
    const userRepository = new UserRepository();

    return userRepository.create({
      name: "Course Creator",
      email: `creator-${randomUUID()}@example.com`,
      password: "123456",
    });
  }

  async function createCourse(creatorId: string) {
    const courseService = new CourseService();

    return courseService.create({
      name: "JavaScript Basics",
      description: "A course about JavaScript",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      creatorId,
    });
  }

  it("should create a lesson when user is course creator", async () => {
    const lessonService = new LessonService();
    const user = await createUser();
    const course = await createCourse(user.id);

    const lesson = await lessonService.create({
      title: "Introduction",
      status: "draft",
      videoUrl: "https://example.com/video",
      courseId: course.id,
      userId: user.id,
    });

    expect(lesson).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: "Introduction",
        status: "draft",
        videoUrl: "https://example.com/video",
        courseId: course.id,
      })
    );
  });

  it("should not create a lesson when user is not course creator", async () => {
    const lessonService = new LessonService();
    const creator = await createUser();
    const anotherUser = await createUser();
    const course = await createCourse(creator.id);

    await expect(
      lessonService.create({
        title: "Introduction",
        status: "draft",
        videoUrl: "https://example.com/video",
        courseId: course.id,
        userId: anotherUser.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not create a lesson with title shorter than 3 characters", async () => {
    const lessonService = new LessonService();
    const user = await createUser();
    const course = await createCourse(user.id);

    await expect(
      lessonService.create({
        title: "JS",
        status: "draft",
        videoUrl: "https://example.com/video",
        courseId: course.id,
        userId: user.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not create a lesson with invalid status", async () => {
    const lessonService = new LessonService();
    const user = await createUser();
    const course = await createCourse(user.id);

    await expect(
      lessonService.create({
        title: "Introduction",
        status: "invalid",
        videoUrl: "https://example.com/video",
        courseId: course.id,
        userId: user.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not create a lesson with invalid video url", async () => {
    const lessonService = new LessonService();
    const user = await createUser();
    const course = await createCourse(user.id);

    await expect(
      lessonService.create({
        title: "Introduction",
        status: "draft",
        videoUrl: "invalid-url",
        courseId: course.id,
        userId: user.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should list lessons by course id", async () => {
    const lessonService = new LessonService();
    const user = await createUser();
    const course = await createCourse(user.id);

    await lessonService.create({
      title: "First Lesson",
      status: "draft",
      videoUrl: "https://example.com/first",
      courseId: course.id,
      userId: user.id,
    });

    await lessonService.create({
      title: "Second Lesson",
      status: "published",
      videoUrl: "https://example.com/second",
      courseId: course.id,
      userId: user.id,
    });

    const lessons = await lessonService.listByCourse(course.id);

    expect(lessons).toHaveLength(2);
    expect(lessons[0]).toEqual(
      expect.objectContaining({
        courseId: course.id,
      })
    );
  });

  it("should get a lesson by id", async () => {
    const lessonService = new LessonService();
    const user = await createUser();
    const course = await createCourse(user.id);

    const createdLesson = await lessonService.create({
      title: "Lesson Details",
      status: "draft",
      videoUrl: "https://example.com/details",
      courseId: course.id,
      userId: user.id,
    });

    const lesson = await lessonService.getById(createdLesson.id);

    expect(lesson).toEqual(
      expect.objectContaining({
        id: createdLesson.id,
        title: "Lesson Details",
        courseId: course.id,
      })
    );
  });

  it("should not get a non-existing lesson", async () => {
    const lessonService = new LessonService();

    await expect(lessonService.getById(randomUUID())).rejects.toBeInstanceOf(AppError);
  });

  it("should update a lesson when user is course creator", async () => {
    const lessonService = new LessonService();
    const user = await createUser();
    const course = await createCourse(user.id);

    const createdLesson = await lessonService.create({
      title: "Old Lesson Title",
      status: "draft",
      videoUrl: "https://example.com/old",
      courseId: course.id,
      userId: user.id,
    });

    const updatedLesson = await lessonService.update(createdLesson.id, user.id, {
      title: "Updated Lesson Title",
      status: "published",
      videoUrl: "https://example.com/updated",
    });

    expect(updatedLesson).toEqual(
      expect.objectContaining({
        id: createdLesson.id,
        title: "Updated Lesson Title",
        status: "published",
        videoUrl: "https://example.com/updated",
      })
    );
  });

  it("should not update a lesson when user is not course creator", async () => {
    const lessonService = new LessonService();
    const creator = await createUser();
    const anotherUser = await createUser();
    const course = await createCourse(creator.id);

    const createdLesson = await lessonService.create({
      title: "Private Lesson",
      status: "draft",
      videoUrl: "https://example.com/private",
      courseId: course.id,
      userId: creator.id,
    });

    await expect(
      lessonService.update(createdLesson.id, anotherUser.id, {
        title: "Invalid Update",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should delete a lesson when user is course creator", async () => {
    const lessonService = new LessonService();
    const user = await createUser();
    const course = await createCourse(user.id);

    const createdLesson = await lessonService.create({
      title: "Lesson To Delete",
      status: "draft",
      videoUrl: "https://example.com/delete",
      courseId: course.id,
      userId: user.id,
    });

    await lessonService.delete(createdLesson.id, user.id);

    await expect(lessonService.getById(createdLesson.id)).rejects.toBeInstanceOf(AppError);
  });

  it("should not delete a lesson when user is not course creator", async () => {
    const lessonService = new LessonService();
    const creator = await createUser();
    const anotherUser = await createUser();
    const course = await createCourse(creator.id);

    const createdLesson = await lessonService.create({
      title: "Private Lesson",
      status: "draft",
      videoUrl: "https://example.com/private",
      courseId: course.id,
      userId: creator.id,
    });

    await expect(lessonService.delete(createdLesson.id, anotherUser.id)).rejects.toBeInstanceOf(
      AppError
    );
  });
});
