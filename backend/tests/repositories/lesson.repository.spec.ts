import { describe, expect, it } from "vitest";
import { UserRepository } from "../../src/repositories/user.repository";
import { CourseRepository } from "../../src/repositories/course.repository";
import { LessonRepository } from "../../src/repositories/lesson.repository";

describe("LessonRepository", () => {
  async function createCourse() {
    const userRepository = new UserRepository();
    const courseRepository = new CourseRepository();

    const email = `creator-${Date.now()}-${Math.random()}@example.com`;

    const user = await userRepository.create({
      name: "Course Creator",
      email,
      password: "123456",
    });

    const course = await courseRepository.create({
      name: "JavaScript Basics",
      description: "A course about JavaScript fundamentals",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      creatorId: user.id,
    });

    return { user, course };
  }

  it("should create a lesson", async () => {
    const lessonRepository = new LessonRepository();
    const { course } = await createCourse();

    const lesson = await lessonRepository.create({
      title: "Introduction",
      status: "draft",
      videoUrl: "https://example.com/video",
      courseId: course.id,
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

  it("should list lessons by course id", async () => {
    const lessonRepository = new LessonRepository();
    const { course } = await createCourse();

    await lessonRepository.create({
      title: "First Lesson",
      status: "draft",
      videoUrl: "https://example.com/first",
      courseId: course.id,
    });

    await lessonRepository.create({
      title: "Second Lesson",
      status: "published",
      videoUrl: "https://example.com/second",
      courseId: course.id,
    });

    const lessons = await lessonRepository.findManyByCourseId(course.id);

    expect(lessons).toHaveLength(2);
    expect(lessons[0]).toEqual(
      expect.objectContaining({
        courseId: course.id,
      })
    );
  });

  it("should find a lesson by id", async () => {
    const lessonRepository = new LessonRepository();
    const { course } = await createCourse();

    const createdLesson = await lessonRepository.create({
      title: "Lesson Details",
      status: "draft",
      videoUrl: "https://example.com/details",
      courseId: course.id,
    });

    const lesson = await lessonRepository.findById(createdLesson.id);

    expect(lesson).toEqual(
      expect.objectContaining({
        id: createdLesson.id,
        title: "Lesson Details",
        courseId: course.id,
      })
    );
  });

  it("should update a lesson", async () => {
    const lessonRepository = new LessonRepository();
    const { course } = await createCourse();

    const createdLesson = await lessonRepository.create({
      title: "Old Lesson Title",
      status: "draft",
      videoUrl: "https://example.com/old",
      courseId: course.id,
    });

    const updatedLesson = await lessonRepository.update(createdLesson.id, {
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

  it("should delete a lesson", async () => {
    const lessonRepository = new LessonRepository();
    const { course } = await createCourse();

    const createdLesson = await lessonRepository.create({
      title: "Lesson To Delete",
      status: "draft",
      videoUrl: "https://example.com/delete",
      courseId: course.id,
    });

    await lessonRepository.delete(createdLesson.id);

    const lesson = await lessonRepository.findById(createdLesson.id);

    expect(lesson).toBeNull();
  });
});
