import request from "supertest";
import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app";

async function createAuthenticatedUser() {
  const email = `lucas-${randomUUID()}@example.com`;

  const response = await request(app).post("/auth/register").send({
    name: "Lucas Fernandes",
    email,
    password: "123456",
  });

  return {
    token: response.body.token,
    user: response.body.user,
  };
}

function futureDateInput(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);

  return date.toISOString().split("T")[0];
}

async function createCourse(token: string) {
  const response = await request(app)
    .post("/courses")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "JavaScript Basics",
      description: "A course about JavaScript",
      startDate: futureDateInput(10),
      endDate: futureDateInput(40),
    });

  return response.body.course;
}

describe("LessonController", () => {
  it("should create a lesson", async () => {
    const { token } = await createAuthenticatedUser();
    const course = await createCourse(token);

    const response = await request(app)
      .post(`/courses/${course.id}/lessons`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Introduction",
        status: "draft",
        videoUrl: "https://example.com/video",
      });

    expect(response.status).toBe(201);
    expect(response.body.lesson).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: "Introduction",
        status: "draft",
        videoUrl: "https://example.com/video",
        courseId: course.id,
      })
    );
  });

  it("should not create a lesson without authentication", async () => {
    const { token } = await createAuthenticatedUser();
    const course = await createCourse(token);

    const response = await request(app).post(`/courses/${course.id}/lessons`).send({
      title: "Introduction",
      status: "draft",
      videoUrl: "https://example.com/video",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token not provided");
  });

  it("should not create a lesson when user is not course creator", async () => {
    const creator = await createAuthenticatedUser();
    const anotherUser = await createAuthenticatedUser();
    const course = await createCourse(creator.token);

    const response = await request(app)
      .post(`/courses/${course.id}/lessons`)
      .set("Authorization", `Bearer ${anotherUser.token}`)
      .send({
        title: "Introduction",
        status: "draft",
        videoUrl: "https://example.com/video",
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not allowed to create lessons for this course");
  });

  it("should list lessons by course id", async () => {
    const { token } = await createAuthenticatedUser();
    const course = await createCourse(token);

    await request(app)
      .post(`/courses/${course.id}/lessons`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "First Lesson",
        status: "draft",
        videoUrl: "https://example.com/first",
      });

    await request(app)
      .post(`/courses/${course.id}/lessons`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Second Lesson",
        status: "published",
        videoUrl: "https://example.com/second",
      });

    const response = await request(app)
      .get(`/courses/${course.id}/lessons`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.lessons).toHaveLength(2);
  });

  it("should get a lesson by id", async () => {
    const { token } = await createAuthenticatedUser();
    const course = await createCourse(token);

    const createResponse = await request(app)
      .post(`/courses/${course.id}/lessons`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Lesson Details",
        status: "draft",
        videoUrl: "https://example.com/details",
      });

    const response = await request(app)
      .get(`/lessons/${createResponse.body.lesson.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.lesson).toEqual(
      expect.objectContaining({
        id: createResponse.body.lesson.id,
        title: "Lesson Details",
        courseId: course.id,
      })
    );
  });

  it("should update a lesson when user is course creator", async () => {
    const { token } = await createAuthenticatedUser();
    const course = await createCourse(token);

    const createResponse = await request(app)
      .post(`/courses/${course.id}/lessons`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Old Lesson Title",
        status: "draft",
        videoUrl: "https://example.com/old",
      });

    const response = await request(app)
      .patch(`/lessons/${createResponse.body.lesson.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Lesson Title",
        status: "published",
        videoUrl: "https://example.com/updated",
      });

    expect(response.status).toBe(200);
    expect(response.body.lesson).toEqual(
      expect.objectContaining({
        id: createResponse.body.lesson.id,
        title: "Updated Lesson Title",
        status: "published",
        videoUrl: "https://example.com/updated",
      })
    );
  });

  it("should not update a lesson when user is not course creator", async () => {
    const creator = await createAuthenticatedUser();
    const anotherUser = await createAuthenticatedUser();
    const course = await createCourse(creator.token);

    const createResponse = await request(app)
      .post(`/courses/${course.id}/lessons`)
      .set("Authorization", `Bearer ${creator.token}`)
      .send({
        title: "Private Lesson",
        status: "draft",
        videoUrl: "https://example.com/private",
      });

    const response = await request(app)
      .patch(`/lessons/${createResponse.body.lesson.id}`)
      .set("Authorization", `Bearer ${anotherUser.token}`)
      .send({
        title: "Invalid Update",
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not allowed to update this lesson");
  });

  it("should delete a lesson when user is course creator", async () => {
    const { token } = await createAuthenticatedUser();
    const course = await createCourse(token);

    const createResponse = await request(app)
      .post(`/courses/${course.id}/lessons`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Lesson To Delete",
        status: "draft",
        videoUrl: "https://example.com/delete",
      });

    const response = await request(app)
      .delete(`/lessons/${createResponse.body.lesson.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });
});
