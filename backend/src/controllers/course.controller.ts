import { Request, Response } from "express";
import { z } from "zod";
import { CourseService } from "../services/course.service";

const createCourseSchema = z.object({
  name: z.string().min(3, "Name must have at least 3 characters"),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

const updateCourseSchema = z.object({
  name: z.string().min(3, "Name must have at least 3 characters").optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

type CourseParams = {
  id: string;
};

export class CourseController {
  async create(req: Request, res: Response) {
    const data = createCourseSchema.parse(req.body);

    const courseService = new CourseService();

    const course = await courseService.create({
      ...data,
      creatorId: req.user!.id,
    });

    return res.status(201).json({
      course,
    });
  }

  async index(req: Request, res: Response) {
    const courseService = new CourseService();

    const courses = await courseService.listByCreator(req.user!.id);

    return res.json({
      courses,
    });
  }

  async show(req: Request<CourseParams>, res: Response) {
    const { id } = req.params;

    const courseService = new CourseService();

    const course = await courseService.getById(id);

    return res.json({
      course,
    });
  }

  async update(req: Request<CourseParams>, res: Response) {
    const { id } = req.params;
    const data = updateCourseSchema.parse(req.body);

    const courseService = new CourseService();

    const course = await courseService.update(id, req.user!.id, data);

    return res.json({
      course,
    });
  }

  async delete(req: Request<CourseParams>, res: Response) {
    const { id } = req.params;

    const courseService = new CourseService();

    await courseService.delete(id, req.user!.id);

    return res.status(204).send();
  }
}
