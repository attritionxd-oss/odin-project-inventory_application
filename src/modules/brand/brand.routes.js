import { Router } from "express";
import { requireRole } from "#middleware/authorize.js";
import brandController from "./brand.controller.js";

const router = Router();

router.get("/", brandController.index);

router.get("/new", requireRole("SPECIALIST", "ADMIN"), brandController.newForm);

router.post("/", requireRole("SPECIALIST", "ADMIN"), brandController.create);

router.get(/^\/(\d+)$/, brandController.show);

router.get(
  /^\/(\d+)\/edit$/,
  requireRole("SPECIALIST", "ADMIN"),
  brandController.editForm,
);

router.post(
  /^\/(\d+)$/,
  requireRole("SPECIALIST", "ADMIN"),
  brandController.update,
);

router.post(/^\/(\d+)\/delete$/, requireRole("ADMIN"), brandController.delete);

router.post(
  /^\/(\d+)\/restore$/,
  requireRole("ANALYST", "ADMIN"),
  brandController.restore,
);

export default router;
