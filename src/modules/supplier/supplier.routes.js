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

router.get("/:id", supplierController.show); // todo: remove this, use edit form directly, but disable editing for unauthorized

router.get(
  "/:id/edit",
  requireRole("SPECIALIST", "ADMIN"),
  supplierController.editForm,
);

router.post(
  "/:id",
  requireRole("SPECIALIST", "ADMIN"),
  supplierController.update,
);

router.post("/:id/delete", requireRole("ADMIN"), supplierController.delete);
router.post(
  "/:id/restore",
  requireRole("ANALYST", "ADMIN"),
  supplierController.restore,
);

export default router;
