import { Router } from "express";
import { LessonController } from "../controllers/lesson.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const lessonRoutes = Router();

const lessonController = new LessonController();

lessonRoutes.use(authMiddleware);

lessonRoutes.get("/courses/:courseId/lessons", (req, res) => lessonController.index(req, res));
lessonRoutes.post("/courses/:courseId/lessons", (req, res) => lessonController.create(req, res));

lessonRoutes.get("/lessons/:id", (req, res) => lessonController.show(req, res));
lessonRoutes.patch("/lessons/:id", (req, res) => lessonController.update(req, res));
lessonRoutes.delete("/lessons/:id", (req, res) => lessonController.delete(req, res));
