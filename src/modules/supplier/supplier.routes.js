import { Router } from "express";
import { requireRole } from "#middleware/authorize.js";
import supplierController from "./supplier.controller.js";

const router = Router();

router.get("/", supplierController.index);

router.get(
  "/new",
  requireRole("SPECIALIST", "ADMIN"),
  supplierController.newForm,
);

router.post("/", requireRole("SPECIALIST", "ADMIN"), supplierController.create);

router.get(/^\/(\d+)$/, supplierController.show);

router.get(
  /^\/(\d+)\/edit$/,
  requireRole("SPECIALIST", "ADMIN"),
  supplierController.editForm,
);

router.post(
  /^\/(\d+)$/,
  requireRole("SPECIALIST", "ADMIN"),
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
