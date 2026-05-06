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

  async findManyByCourseId(courseId: string) {
    return prisma.lesson.findMany({
      where: { courseId },
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
