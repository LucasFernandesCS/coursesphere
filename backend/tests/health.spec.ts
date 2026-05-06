import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("Health check", () => {
  it("should return API status message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "CourseSphere API is running",
    });
  });
});