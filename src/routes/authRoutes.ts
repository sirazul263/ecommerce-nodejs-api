import { Router } from "express";
import { register, login, adminLogin } from "../controllers/authController";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);

export default router;
