import { Router } from "express";
import { requireRole } from "#middleware/authorize.js";
import categoryController from "./category.controller.js";

const router = Router();

router.get("/", categoryController.index);

router.get(
  "/new",
  requireRole("SPECIALIST", "ADMIN"),
  categoryController.newForm,
);

router.post("/", requireRole("SPECIALIST", "ADMIN"), categoryController.create);

router.get(/^\/(\d+)$/, categoryController.show);

router.get(
  /^\/(\d+)\/edit$/,
  requireRole("SPECIALIST", "ADMIN"),
  categoryController.editForm,
);

router.post(
  /^\/(\d+)$/,
  requireRole("SPECIALIST", "ADMIN"),
  categoryController.update,
);

router.post(
  /^\/(\d+)\/delete$/,
  requireRole("ADMIN"),
  categoryController.delete,
);

export default router;
