import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const courseRoutes = Router();

const courseController = new CourseController();

courseRoutes.use(authMiddleware);

courseRoutes.get("/", (req, res) => courseController.index(req, res));
courseRoutes.post("/", (req, res) => courseController.create(req, res));
courseRoutes.get("/:id", (req, res) => courseController.show(req, res));
courseRoutes.patch("/:id", (req, res) => courseController.update(req, res));
courseRoutes.delete("/:id", (req, res) => courseController.delete(req, res));
