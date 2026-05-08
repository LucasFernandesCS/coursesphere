import { prisma } from "../config/prisma";

type CreateCourseData = {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  creatorId: string;
};

type UpdateCourseData = {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
};

export class CourseRepository {
  async create(data: CreateCourseData) {
    return prisma.course.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        lessons: true,
      },
    });
  }

  async findManyByCreatorId(creatorId: string) {
    return prisma.course.findMany({
      where: {
        creatorId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            lessons: {
              where: {
                status: "published",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findMany() {
    return prisma.course.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            lessons: {
              where: {
                status: "published",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(id: string, data: UpdateCourseData) {
    return prisma.course.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  }
}
