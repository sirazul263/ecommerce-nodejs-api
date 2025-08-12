import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, isAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, isAdmin },
    });
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(500).json({ error: "User registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ status: 0, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ status: 0, message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    res.json({ status: 1, token: token, user: user });
  } catch (err) {
    res.status(500).json({ status: 0, message: "Login failed" });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ status: 0, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch || !user.isAdmin)
      return res
        .status(401)
        .json({ status: 0, message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    res.json({ status: 1, token: token, user: user });
  } catch (err) {
    res.status(500).json({ status: 0, message: "Login failed" });
  }
};
