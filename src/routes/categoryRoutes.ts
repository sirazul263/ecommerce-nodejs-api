import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.get("/", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/", authMiddleware, createCategory);
router.put("/categories/:id", authMiddleware, updateCategory);
router.delete("/categories/:id", authMiddleware, deleteCategory);

export default router;
