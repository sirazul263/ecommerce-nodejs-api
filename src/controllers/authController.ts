import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  sendForgotPasswordEmail,
  sendVerificationEmail,
} from "../utils/sendEmail";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ status: 0, message: "Email already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin: false,
        emailVerificationToken: verificationToken,
      },
    });

    // Send verification email
    sendVerificationEmail(email, firstName, verificationToken).catch(
      console.error
    );
    res.status(201).json({
      status: 1,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ status: 0, message: "User registration failed" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).send({ status: 0, message: "Invalid token" });
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user)
      return res.status(400).send({
        status: 0,
        message: "Invalid or expired token",
      });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null },
    });

    res.json({
      status: 1,
      message: "Email verified successfully. You can now log in!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 0, message: "Verification failed" });
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

    // Block login if email is not verified
    if (!user.emailVerified) {
      return res.status(403).json({
        status: 0,
        message: "Please verify your email before logging in",
      });
    }

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

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: 0, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return res.status(401).json({ status: 0, message: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: 0, message: "Current password is incorrect" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ status: 1, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ status: 0, message: "Failed to change password" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ status: 0, message: "Email not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry,
      },
    });

    await sendForgotPasswordEmail(email, user.firstName, resetToken);

    res.json({
      status: 1,
      message: "Password reset email sent. Check your inbox.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: "Failed to send reset email" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token)
      return res.status(400).json({ status: 0, message: "Invalid token" });

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gte: new Date() }, // token still valid
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: 0, message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    res.json({
      status: 1,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: "Failed to reset password" });
  }
};
