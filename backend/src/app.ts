import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CourseSphere API is running",
  });
});

app.use(errorMiddleware);
