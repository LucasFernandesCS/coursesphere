import { prisma } from "../config/prisma";

type CreateUserData = {
  name: string;
  email: string;
  password: string;
};

export class UserRepository {
  async create(data: CreateUserData) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
    });
  }
}