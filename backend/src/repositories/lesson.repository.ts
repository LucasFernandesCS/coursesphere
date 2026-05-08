import { prisma } from "../config/prisma";

type CreateLessonData = {
  title: string;
  status?: string;
  videoUrl?: string;
  courseId: string;
};

type UpdateLessonData = {
  title?: string;
  status?: string;
  videoUrl?: string | null;
};

type FindManyByCourseIdFilters = {
  status?: string;
};
export class LessonRepository {
  async create(data: CreateLessonData) {
    return prisma.lesson.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });
  }

  async findManyByCourseId(courseId: string, filters?: FindManyByCourseIdFilters) {
    return prisma.lesson.findMany({
      where: {
        courseId,
        ...(filters?.status ? { status: filters.status } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(id: string, data: UpdateLessonData) {
    return prisma.lesson.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.lesson.delete({
      where: { id },
    });
  }
}
