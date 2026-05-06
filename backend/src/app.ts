import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import { authRoutes } from "./routes/auth.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CourseSphere API is running",
  });
});

app.use("/auth", authRoutes);

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.flatten().fieldErrors,
    });
  }

  return errorMiddleware(error, req, res, next);
});
