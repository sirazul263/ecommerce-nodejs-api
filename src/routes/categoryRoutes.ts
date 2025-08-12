import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { validate } from "../utils/validate";
import { categorySchema } from "../types/category";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", adminMiddleware, validate(categorySchema), createCategory);
router.put("/:id", adminMiddleware, validate(categorySchema), updateCategory);
router.delete("/:id", adminMiddleware, deleteCategory);

export default router;
