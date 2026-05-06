import request from "supertest";
import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app";

describe("AuthController", () => {
  it("should register a user", async () => {
    const email = `lucas-${randomUUID()}@example.com`;

    const response = await request(app).post("/auth/register").send({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          name: "Lucas Fernandes",
          email,
        }),
      })
    );
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should not register with invalid email", async () => {
    const response = await request(app).post("/auth/register").send({
      name: "Lucas Fernandes",
      email: "invalid-email",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation error");
  });

  it("should login a user", async () => {
    const email = `lucas-${randomUUID()}@example.com`;

    await request(app).post("/auth/register").send({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    const response = await request(app).post("/auth/login").send({
      email,
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          name: "Lucas Fernandes",
          email,
        }),
      })
    );
  });

  it("should not login with invalid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: `not-found-${randomUUID()}@example.com`,
        password: "123456",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should return authenticated user profile", async () => {
    const email = `lucas-${randomUUID()}@example.com`;

    const registerResponse = await request(app).post("/auth/register").send({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${registerResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(
      expect.objectContaining({
        id: registerResponse.body.user.id,
        name: "Lucas Fernandes",
        email,
      })
    );
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should not return profile without token", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token not provided");
  });
});
