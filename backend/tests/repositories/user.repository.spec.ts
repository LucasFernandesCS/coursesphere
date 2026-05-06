import { describe, expect, it } from "vitest";
import { UserRepository } from "../../src/repositories/user.repository";

describe("UserRepository", () => {
  it("should create a user", async () => {
    const userRepository = new UserRepository();

    const email = `lucas-${Date.now()}@example.com`;

    const user = await userRepository.create({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "Lucas Fernandes",
        email,
      })
    );

    expect(user).not.toHaveProperty("password");
  });

  it("should find a user by email", async () => {
    const userRepository = new UserRepository();

    const email = `lucas-${Date.now()}@example.com`;

    await userRepository.create({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    const user = await userRepository.findByEmail(email);

    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "Lucas Fernandes",
        email,
      })
    );
  });

  it("should return null when user email does not exist", async () => {
    const userRepository = new UserRepository();

    const user = await userRepository.findByEmail(`not-found-${Date.now()}@example.com`);

    expect(user).toBeNull();
  });
  it("should find a user by id", async () => {
    const userRepository = new UserRepository();

    const email = `lucas-${Date.now()}-${Math.random()}@example.com`;

    const createdUser = await userRepository.create({
      name: "Lucas Fernandes",
      email,
      password: "123456",
    });

    const user = await userRepository.findById(createdUser.id);

    expect(user).toEqual(
      expect.objectContaining({
        id: createdUser.id,
        name: "Lucas Fernandes",
        email,
      })
    );

    expect(user).not.toHaveProperty("password");
  });

  it("should return null when user id does not exist", async () => {
    const userRepository = new UserRepository();

    const user = await userRepository.findById("00000000-0000-0000-0000-000000000000");

    expect(user).toBeNull();
  });
});
