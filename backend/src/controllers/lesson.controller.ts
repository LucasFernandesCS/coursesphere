import { Request, Response } from "express";
import { z } from "zod";
import { LessonService } from "../services/lesson.service";

const createLessonSchema = z.object({
  title: z.string().min(3, "Title must have at least 3 characters"),
  status: z.enum(["draft", "published"]).optional(),
  videoUrl: z.string().url("Video URL must be valid").optional(),
});

const updateLessonSchema = z.object({
  title: z.string().min(3, "Title must have at least 3 characters").optional(),
  status: z.enum(["draft", "published"]).optional(),
  videoUrl: z.string().url("Video URL must be valid").nullable().optional(),
});

type CourseParams = {
  courseId: string;
};

type LessonParams = {
  id: string;
};

export class LessonController {
  async create(req: Request<CourseParams>, res: Response) {
    const { courseId } = req.params;
    const data = createLessonSchema.parse(req.body);

    const lessonService = new LessonService();

    const lesson = await lessonService.create({
      ...data,
      courseId,
      userId: req.user!.id,
    });

    return res.status(201).json({
      lesson,
    });
  }

  async index(req: Request<CourseParams>, res: Response) {
    const { courseId } = req.params;

    const lessonService = new LessonService();

    const lessons = await lessonService.listByCourse(courseId);

    return res.json({
      lessons,
    });
  }

  async show(req: Request<LessonParams>, res: Response) {
    const { id } = req.params;

    const lessonService = new LessonService();

    const lesson = await lessonService.getById(id);

    return res.json({
      lesson,
    });
  }

  async update(req: Request<LessonParams>, res: Response) {
    const { id } = req.params;
    const data = updateLessonSchema.parse(req.body);

    const lessonService = new LessonService();

    const lesson = await lessonService.update(id, req.user!.id, data);

    return res.json({
      lesson,
    });
  }

  async delete(req: Request<LessonParams>, res: Response) {
    const { id } = req.params;

    const lessonService = new LessonService();

    await lessonService.delete(id, req.user!.id);

    return res.status(204).send();
  }
}
