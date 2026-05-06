import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must have at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export class AuthController {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);

    const authService = new AuthService();
    const result = await authService.register(data);

    return res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);

    const authService = new AuthService();
    const result = await authService.login(data);

    return res.json(result);
  }

  async me(req: Request, res: Response) {
    const authService = new AuthService();
    const user = await authService.getProfile(req.user!.id);

    return res.json({
      user,
    });
  }
}
