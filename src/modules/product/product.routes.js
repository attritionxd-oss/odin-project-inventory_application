import { Router } from "express";
import { requireRole } from "#middleware/authorize.js";
import {
  validateProductFilter,
  productController,
  validateProduct,
} from "./product.controller.js";

const router = Router();

router.get("/", validateProductFilter, productController.index);

router.get(
  "/new",
  requireRole("SPECIALIST", "ADMIN"),
  validateProductFilter,
  productController.newForm,
);

router.post(
  "/",
  requireRole("SPECIALIST", "ADMIN"),
  validateProduct,
  productController.create,
);

router.get(/^\/(\d+)$/, productController.show);

router.get(
  /^\/(\d+)\/edit$/,
  requireRole("SPECIALIST", "ADMIN"),
  productController.editForm,
);

router.post(
  /^\/(\d+)$/,
  requireRole("SPECIALIST", "ADMIN"),
  validateProduct,
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
