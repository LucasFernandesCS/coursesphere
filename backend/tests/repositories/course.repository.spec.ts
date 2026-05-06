import { describe, expect, it } from "vitest";
import { UserRepository } from "../../src/repositories/user.repository";
import { CourseRepository } from "../../src/repositories/course.repository";

describe("CourseRepository", () => {
  it("should create a course", async () => {
    const userRepository = new UserRepository();
    const courseRepository = new CourseRepository();

    const email = `creator-${Date.now()}@example.com`;

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

    expect(course).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "JavaScript Basics",
        description: "A course about JavaScript fundamentals",
        creatorId: user.id,
      })
    );
  });

  it("should find a course by id", async () => {
    const userRepository = new UserRepository();
    const courseRepository = new CourseRepository();

    const email = `creator-${Date.now()}@example.com`;

    const user = await userRepository.create({
      name: "Course Creator",
      email,
      password: "123456",
    });

    const createdCourse = await courseRepository.create({
      name: "TypeScript Basics",
      description: "A course about TypeScript fundamentals",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      creatorId: user.id,
    });

    const course = await courseRepository.findById(createdCourse.id);

    expect(course).toEqual(
      expect.objectContaining({
        id: createdCourse.id,
        name: "TypeScript Basics",
        creatorId: user.id,
      })
    );
  });

  it("should list courses by creator id", async () => {
    const userRepository = new UserRepository();
    const courseRepository = new CourseRepository();

    const email = `creator-${Date.now()}@example.com`;

    const user = await userRepository.create({
      name: "Course Creator",
      email,
      password: "123456",
    });

    await courseRepository.create({
      name: "React Basics",
      description: "A course about React",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      creatorId: user.id,
    });

    await courseRepository.create({
      name: "Node Basics",
      description: "A course about Node",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-04-01"),
      creatorId: user.id,
    });

    const courses = await courseRepository.findManyByCreatorId(user.id);

    expect(courses).toHaveLength(2);
    expect(courses[0]).toEqual(
      expect.objectContaining({
        creatorId: user.id,
      })
    );
  });

  it("should update a course", async () => {
    const userRepository = new UserRepository();
    const courseRepository = new CourseRepository();

    const email = `creator-${Date.now()}@example.com`;

    const user = await userRepository.create({
      name: "Course Creator",
      email,
      password: "123456",
    });

    const createdCourse = await courseRepository.create({
      name: "Old Course Name",
      description: "Old description",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      creatorId: user.id,
    });

    const updatedCourse = await courseRepository.update(createdCourse.id, {
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

  it("should delete a course", async () => {
    const userRepository = new UserRepository();
    const courseRepository = new CourseRepository();

    const email = `creator-${Date.now()}@example.com`;

    const user = await userRepository.create({
      name: "Course Creator",
      email,
      password: "123456",
    });

    const createdCourse = await courseRepository.create({
      name: "Course To Delete",
      description: "This course will be deleted",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      creatorId: user.id,
    });

    await courseRepository.delete(createdCourse.id);

    const course = await courseRepository.findById(createdCourse.id);

    expect(course).toBeNull();
  });
});
