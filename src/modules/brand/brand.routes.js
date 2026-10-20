import { Router } from "express";
import { requireRole } from "#middleware/authorize.js";
import { validate } from "#middleware/validate.js";
import { validateBrand } from "./brand.validation.js";
import brandController from "./brand.controller.js";

const router = Router();

router.get("/", brandController.index);

router.get("/new", brandController.newForm);

router.post(
  "/",
  requireRole("ENCODER", "ADMIN"),
  validate(validateBrand),
  brandController.create,
);

router.get(/^\/(\d+)$/, brandController.show);

router.get(/^\/(\d+)\/edit$/, brandController.editForm);

router.post(
  /^\/(\d+)$/,
  requireRole("SPECIALIST", "ADMIN"),
  validate(validateBrand),
  brandController.update,
);

router.post(/^\/(\d+)\/delete$/, requireRole("ADMIN"), brandController.delete);

router.post(
  /^\/(\d+)\/restore$/,
  requireRole("ANALYST", "ADMIN"),
  brandController.restore,
);

export default router;
