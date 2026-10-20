import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "#middleware/validate.js";
import { validateLogin } from "./auth.validation.js";

const router = Router();

router.get("/login", authController.showLoginForm);
router.post("/login", validate(validateLogin), authController.login);
router.post("/logout", authController.logout);

export default router;
