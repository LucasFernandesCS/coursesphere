import { AppError } from "../errors/AppError";
import { CourseRepository } from "../repositories/course.repository";

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

export class CourseService {
  constructor(private readonly courseRepository = new CourseRepository()) {}

  async create(data: CreateCourseData) {
    this.validateName(data.name);
    this.validateDates(data.startDate, data.endDate);

    return this.courseRepository.create(data);
  }

  async listByCreator(creatorId: string) {
    return this.courseRepository.findManyByCreatorId(creatorId);
  }

  async getById(id: string) {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    return course;
  }

  async update(id: string, userId: string, data: UpdateCourseData) {
    const course = await this.getById(id);

    if (course.creatorId !== userId) {
      throw new AppError("You are not allowed to update this course", 403);
    }

    const startDate = data.startDate ?? course.startDate;
    const endDate = data.endDate ?? course.endDate;

    if (data.name !== undefined) {
      this.validateName(data.name);
    }

    this.validateDates(startDate, endDate);

    return this.courseRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    const course = await this.getById(id);

    if (course.creatorId !== userId) {
      throw new AppError("You are not allowed to delete this course", 403);
    }

    await this.courseRepository.delete(id);
  }

  private validateName(name: string) {
    if (!name || name.trim().length < 3) {
      throw new AppError("Course name must have at least 3 characters", 400);
    }
  }

  private validateDates(startDate: Date, endDate: Date) {
    if (!startDate || !endDate) {
      throw new AppError("Start date and end date are required", 400);
    }

    if (endDate < startDate) {
      throw new AppError("End date must be equal to or after start date", 400);
    }
  }
}
