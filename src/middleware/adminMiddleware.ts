import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
interface JwtPayload {
  userId: number;
  isAdmin: boolean;
}

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: 0, message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (decoded.isAdmin) {
      (req as any).user = { id: decoded.userId };
      next();
    } else {
      return res.status(403).json({
        status: 0,
        message: "You are not authorized to perform this action",
      });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ status: 0, message: "Unauthorized: Invalid token" });
  }
};
