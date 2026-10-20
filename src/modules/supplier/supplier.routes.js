import { Router } from "express";
import { requireRole } from "#middleware/authorize.js";
import { validate } from "#middleware/validate.js";
import { validateSupplier } from "./supplier.validation.js";
import supplierController from "./supplier.controller.js";

const router = Router();

router.get("/", supplierController.index);

router.get("/new", supplierController.newForm);

router.post(
  "/",
  requireRole("SPECIALIST", "ADMIN"),
  validate(validateSupplier),
  supplierController.create,
);

router.get(/^\/(\d+)$/, supplierController.show);

router.get(/^\/(\d+)\/edit$/, supplierController.editForm);

router.post(
  /^\/(\d+)$/,
  requireRole("SPECIALIST", "ADMIN"),
  validate(validateSupplier),
  supplierController.update,
);

router.post(
  /^\/(\d+)\/delete$/,
  requireRole("ADMIN"),
  supplierController.delete,
);

router.post(
  /^\/(\d+)\/restore$/,
  requireRole("ANALYST", "ADMIN"),
  supplierController.restore,
);

export default router;
