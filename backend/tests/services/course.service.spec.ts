import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import { CourseService } from "../../src/services/course.service";
import { UserRepository } from "../../src/repositories/user.repository";
import { AppError } from "../../src/errors/AppError";

describe("CourseService", () => {
  async function createUser() {
    const userRepository = new UserRepository();

    return userRepository.create({
      name: "Course Creator",
      email: `creator-${randomUUID()}@example.com`,
      password: "123456",
    });
  }

  function futureDate(daysFromNow: number) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(0, 0, 0, 0);

    return date;
  }

  function pastDate(daysAgo: number) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    return date;
  }

  it("should create a course", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    const course = await courseService.create({
      name: "JavaScript Basics",
      description: "A course about JavaScript fundamentals",
      startDate: futureDate(10),
      endDate: futureDate(40),
      creatorId: user.id,
    });

    expect(course).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "JavaScript Basics",
        description: "A course about JavaScript fundamentals",
        creatorId: user.id,
      })
    );
  });

  it("should not create a course with name shorter than 3 characters", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    await expect(
      courseService.create({
        name: "JS",
        description: "Invalid course",
        startDate: futureDate(10),
        endDate: futureDate(40),
        creatorId: user.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not create a course with end date before start date", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    await expect(
      courseService.create({
        name: "JavaScript Basics",
        description: "Invalid date course",
        startDate: futureDate(40),
        endDate: futureDate(10),
        creatorId: user.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not create a course with start date in the past", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    await expect(
      courseService.create({
        name: "Past Course",
        description: "Invalid course date",
        startDate: pastDate(1),
        endDate: futureDate(10),
        creatorId: user.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should list courses by creator id", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    await courseService.create({
      name: "React Basics",
      description: "A course about React",
      startDate: futureDate(10),
      endDate: futureDate(40),
      creatorId: user.id,
    });

    await courseService.create({
      name: "Node Basics",
      description: "A course about Node",
      startDate: futureDate(50),
      endDate: futureDate(80),
      creatorId: user.id,
    });

    const courses = await courseService.listByCreator(user.id);

    expect(courses).toHaveLength(2);
    expect(courses[0]).toEqual(
      expect.objectContaining({
        creatorId: user.id,
      })
    );
  });

  it("should get a course by id", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    const createdCourse = await courseService.create({
      name: "TypeScript Basics",
      description: "A course about TypeScript",
      startDate: futureDate(10),
      endDate: futureDate(40),
      creatorId: user.id,
    });

    const course = await courseService.getById(createdCourse.id);

    expect(course).toEqual(
      expect.objectContaining({
        id: createdCourse.id,
        name: "TypeScript Basics",
        creatorId: user.id,
      })
    );
  });

  it("should not get a non-existing course", async () => {
    const courseService = new CourseService();

    await expect(courseService.getById(randomUUID())).rejects.toBeInstanceOf(AppError);
  });

  it("should update a course when user is creator", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    const createdCourse = await courseService.create({
      name: "Old Course Name",
      description: "Old description",
      startDate: futureDate(10),
      endDate: futureDate(40),
      creatorId: user.id,
    });

    const updatedCourse = await courseService.update(createdCourse.id, user.id, {
      name: "Updated Course Name",
      description: "Updated description",
    });

    expect(updatedCourse).toEqual(
      expect.objectContaining({
        id: createdCourse.id,
        name: "Updated Course Name",
        description: "Updated description",
      })
    );
  });

  it("should not update a course with start date in the past", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    const createdCourse = await courseService.create({
      name: "Future Course",
      description: "Valid course",
      startDate: futureDate(10),
      endDate: futureDate(40),
      creatorId: user.id,
    });

    await expect(
      courseService.update(createdCourse.id, user.id, {
        startDate: pastDate(1),
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not update a course with end date before start date", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    const createdCourse = await courseService.create({
      name: "Future Course",
      description: "Valid course",
      startDate: futureDate(10),
      endDate: futureDate(40),
      creatorId: user.id,
    });

    await expect(
      courseService.update(createdCourse.id, user.id, {
        startDate: futureDate(50),
        endDate: futureDate(20),
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not update a course when user is not creator", async () => {
    const courseService = new CourseService();
    const creator = await createUser();
    const anotherUser = await createUser();

    const createdCourse = await courseService.create({
      name: "Private Course",
      description: "Only creator can update",
      startDate: futureDate(10),
      endDate: futureDate(40),
      creatorId: creator.id,
    });

    await expect(
      courseService.update(createdCourse.id, anotherUser.id, {
        name: "Invalid Update",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should delete a course when user is creator", async () => {
    const courseService = new CourseService();
    const user = await createUser();

    const createdCourse = await courseService.create({
      name: "Course To Delete",
      description: "This course will be deleted",
      startDate: futureDate(10),
      endDate: futureDate(40),
      creatorId: user.id,
    });

    await courseService.delete(createdCourse.id, user.id);

    await expect(courseService.getById(createdCourse.id)).rejects.toBeInstanceOf(AppError);
  });

  it("should not delete a course when user is not creator", async () => {
    const courseService = new CourseService();
    const creator = await createUser();
    const anotherUser = await createUser();

    const createdCourse = await courseService.create({
      name: "Private Course",
      description: "Only creator can delete",
      startDate: futureDate(10),
      endDate: futureDate(40),
      creatorId: creator.id,
    });

    await expect(courseService.delete(createdCourse.id, anotherUser.id)).rejects.toBeInstanceOf(
      AppError
    );
  });
});
