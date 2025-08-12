import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ucFirst } from "../utils/libs";
import slugify from "slugify";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Get all categories
interface JwtPayload {
  userId: number;
}
export const getCategories = async (req: Request, res: Response) => {
  try {
    let includeCreatedBy = false;
    // Extract status filter from  query
    const { status } = req.query;
    let statusFilter: any = undefined;
    if (status) {
      statusFilter = { status: status };
    }
    // 1. Extract and verify Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as JwtPayload;

        // 2. Fetch user and check if isAdmin
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { isAdmin: true },
        });

        if (user?.isAdmin) {
          includeCreatedBy = true;
        }
      } catch (error) {
        // Invalid token or verification failed — silently ignore and treat as non-admin
      }
    }

    // Query categories with or without createdBy relation based on admin status
    const categories = await prisma.category.findMany({
      where: statusFilter,
      include: includeCreatedBy
        ? {
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          }
        : undefined,
    });
    res.status(200).json({
      status: 1,
      data: categories,
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ status: 0, message: "Failed to fetch categories" });
  }
};

// Get one category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ status: 0, message: "Unauthorized" });
  }
  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category)
      return res.status(404).json({ status: 0, message: "Category not found" });
    res.status(200).json({ status: 1, data: category });
  } catch (err) {
    res.status(500).json({ status: 0, message: "Failed to fetch category" });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ status: 0, message: "Unauthorized" });
  }

  const { image, status } = req.body;
  const name = ucFirst(req.body.name);
  const slug = slugify(req.body.name, { lower: true });

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image,
        status,
        createdById: user.id,
      },
    });
    res.status(201).json({ status: 1, message: "Category created", category });
  } catch (err) {
    res.status(500).json({ status: 0, message: "Failed to create category" });
  }
};

// Update a category by ID
export const updateCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ status: 0, message: "Unauthorized" });
  }
  const { name, image, status } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, image, status },
    });
    res.status(200).json({ status: 1, message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ status: 0, message: "Failed to update category" });
  }
};

// Delete a category by ID
export const deleteCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ status: 0, message: "Unauthorized" });
  }
  try {
    await prisma.category.delete({ where: { id } });
    res.status(200).json({ status: 1, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ status: 0, message: "Failed to delete category" });
  }
};
