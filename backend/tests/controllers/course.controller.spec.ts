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

describe("CourseController", () => {
  it("should create a course", async () => {
    const { token, user } = await createAuthenticatedUser();

    const response = await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "JavaScript Basics",
        description: "A course about JavaScript",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
      });

    expect(response.status).toBe(201);
    expect(response.body.course).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "JavaScript Basics",
        description: "A course about JavaScript",
        creatorId: user.id,
      })
    );
  });

  it("should not create a course without authentication", async () => {
    const response = await request(app).post("/courses").send({
      name: "JavaScript Basics",
      description: "A course about JavaScript",
      startDate: "2026-01-01",
      endDate: "2026-02-01",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token not provided");
  });

  it("should list courses from authenticated user", async () => {
    const { token } = await createAuthenticatedUser();

    await request(app).post("/courses").set("Authorization", `Bearer ${token}`).send({
      name: "React Basics",
      description: "A course about React",
      startDate: "2026-01-01",
      endDate: "2026-02-01",
    });

    await request(app).post("/courses").set("Authorization", `Bearer ${token}`).send({
      name: "Node Basics",
      description: "A course about Node",
      startDate: "2026-03-01",
      endDate: "2026-04-01",
    });

    const response = await request(app).get("/courses").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.courses).toHaveLength(2);
  });

  it("should get a course by id", async () => {
    const { token } = await createAuthenticatedUser();

    const createResponse = await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "TypeScript Basics",
        description: "A course about TypeScript",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
      });

    const response = await request(app)
      .get(`/courses/${createResponse.body.course.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.course).toEqual(
      expect.objectContaining({
        id: createResponse.body.course.id,
        name: "TypeScript Basics",
      })
    );
  });

  it("should update a course when user is creator", async () => {
    const { token } = await createAuthenticatedUser();

    const createResponse = await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Old Course Name",
        description: "Old description",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
      });

    const response = await request(app)
      .patch(`/courses/${createResponse.body.course.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Course Name",
        description: "Updated description",
      });

    expect(response.status).toBe(200);
    expect(response.body.course).toEqual(
      expect.objectContaining({
        id: createResponse.body.course.id,
        name: "Updated Course Name",
        description: "Updated description",
      })
    );
  });

  it("should not update a course when user is not creator", async () => {
    const creator = await createAuthenticatedUser();
    const anotherUser = await createAuthenticatedUser();

    const createResponse = await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({
        name: "Private Course",
        description: "Only creator can update",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
      });

    const response = await request(app)
      .patch(`/courses/${createResponse.body.course.id}`)
      .set("Authorization", `Bearer ${anotherUser.token}`)
      .send({
        name: "Invalid Update",
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not allowed to update this course");
  });

  it("should delete a course when user is creator", async () => {
    const { token } = await createAuthenticatedUser();

    const createResponse = await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Course To Delete",
        description: "This course will be deleted",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
      });

    const response = await request(app)
      .delete(`/courses/${createResponse.body.course.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });
});
