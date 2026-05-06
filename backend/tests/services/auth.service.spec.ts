import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import { AuthService } from "../../src/services/auth.service";
import { AppError } from "../../src/errors/AppError";

describe("AuthService", () => {
  it("should register a user", async () => {
    const authService = new AuthService();

    const email = `lucas-${randomUUID()}@example.com`;

    const result = await authService.register({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    expect(result).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          name: "Lucas Fernandes",
          email,
        }),
      })
    );

    expect(result.user).not.toHaveProperty("password");
  });

  it("should not register a user with duplicated email", async () => {
    const authService = new AuthService();

    const email = `lucas-${randomUUID()}@example.com`;

    await authService.register({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    await expect(
      authService.register({
        name: "Lucas Fernandes",
        email,
        password: "123456",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should login with valid credentials", async () => {
    const authService = new AuthService();

    const email = `lucas-${randomUUID()}@example.com`;

    await authService.register({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    const result = await authService.login({
      email,
      password: "123456",
    });

    expect(result).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          name: "Lucas Fernandes",
          email,
        }),
      })
    );

    expect(result.user).not.toHaveProperty("password");
  });

  it("should not login with invalid email", async () => {
    const authService = new AuthService();

    await expect(
      authService.login({
        email: `not-found-${randomUUID()}@example.com`,
        password: "123456",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not login with invalid password", async () => {
    const authService = new AuthService();

    const email = `lucas-${randomUUID()}@example.com`;

    await authService.register({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    await expect(
      authService.login({
        email,
        password: "wrong-password",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should get user profile", async () => {
    const authService = new AuthService();

    const email = `lucas-${randomUUID()}@example.com`;

    const { user } = await authService.register({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    const profile = await authService.getProfile(user.id);

    expect(profile).toEqual(
      expect.objectContaining({
        id: user.id,
        name: "Lucas Fernandes",
        email,
      })
    );

    expect(profile).not.toHaveProperty("password");
  });

  it("should not get profile from non-existing user", async () => {
    const authService = new AuthService();

    await expect(authService.getProfile(randomUUID())).rejects.toBeInstanceOf(AppError);
  });
});
