import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "coursesphere_secret";

export function generateToken(userId: string) {
  return jwt.sign({ sub: userId }, jwtSecret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret) as { sub: string };
}