import { body } from "express-validator";

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
  body("redirectTo").optional().trim(),
];
