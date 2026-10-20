import { Router } from "express";
import { requireRole } from "#middleware/authorize.js";
import { validate } from "#middleware/validate.js";
import { validateCategory } from "./category.validation.js";
import categoryController from "./category.controller.js";

const router = Router();

router.get("/", categoryController.index);

router.get("/new", categoryController.newForm);

router.post(
  "/",
  requireRole("ENCODER", "ADMIN"),
  validate(validateCategory),
  categoryController.create,
);

router.get(/^\/(\d+)$/, categoryController.show);

router.get(
  /^\/(\d+)\/edit$/,
  requireRole("SPECIALIST", "ADMIN"),
  categoryController.editForm,
);

router.post(
  /^\/(\d+)$/,
  requireRole("SPECIALIST", "ADMIN"),
  validate(validateCategory),
  categoryController.update,
);

router.post(
  /^\/(\d+)\/delete$/,
  requireRole("ADMIN"),
  categoryController.delete,
);

export default router;
