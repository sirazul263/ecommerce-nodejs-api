import { Router } from "express";
import {
  register,
  login,
  adminLogin,
  verifyEmail,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { registerSchema } from "../types/register";
import { validate } from "../utils/validate";
import { authMiddleware } from "../middleware/auth";
import { changePasswordSchema } from "../types/changePassword";

const router = Router();
router.post("/register", validate(registerSchema), register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

//After login
router.post(
  "/change-password",
  validate(changePasswordSchema),
  authMiddleware,
  changePassword
);
export default router;
