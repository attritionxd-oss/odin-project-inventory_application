import { Router } from "express";
import { requireRole } from "#middleware/authorize.js";
import { validate } from "#middleware/validate.js";
import { productController } from "./product.controller.js";
import {
  validateProductFilter,
  validateProduct,
} from "./product.validation.js";

const router = Router();

router.get("/", validateProductFilter, productController.index);

router.get("/new", validate(validateProductFilter), productController.newForm);

router.post(
  "/",
  requireRole("ENCODER", "ADMIN"),
  validate(validateProduct),
  productController.create,
);

router.get(/^\/(\d+)$/, productController.show);

router.get(/^\/(\d+)\/edit$/, productController.editForm);

router.post(
  /^\/(\d+)$/,
  requireRole("SPECIALIST", "ADMIN"),
  validate(validateProduct),
  productController.update,
);

router.post(
  /^\/(\d+)\/delete$/,
  requireRole("ADMIN"),
  productController.delete,
);

router.post(
  /^\/(\d+)\/restore$/,
  requireRole("ANALYST", "ADMIN"),
  productController.restore,
);

export default router;
