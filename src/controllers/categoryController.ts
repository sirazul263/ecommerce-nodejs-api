import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Get one category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json({ category });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  const { name, image } = req.body;
  try {
    const category = await prisma.category.create({
      data: { name, image },
    });
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

// Update a category by ID
export const updateCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, image } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, image },
    });
    res.status(200).json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Delete a category by ID
export const deleteCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    await prisma.category.delete({ where: { id } });
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};
