import supplierService from "#models/core/suppliers/supplier.service.js";
import { renderWithLayout } from "#utils/renderHelper.js";
import { formatTimestamp } from "#utils/formatTimestamp.js";

const supplierController = {
  index: async (req, res, next) => {
    try {
      const includeDeleted =
        res.locals?.currentUser.role === "ADMIN" ||
        res.locals?.currentUser.role === "ANALYST";

      const allowedSortFields = {
        id: "id",
        name: "supplier_name",
        contact: "contact_email",
        created: "created_at",
        deleted: "deleted_at",
      };

      const sortQuery = req.query.sort;
      const orderQuery = req.query.order?.toLowerCase();

      const currentSort = allowedSortFields[sortQuery] ? sortQuery : "name";
      const orderByField = allowedSortFields[currentSort];
      const isOrderAscBool = orderQuery === "desc" ? false : true;

      const suppliers = await supplierService.getAll({
        includeDeleted,
        orderByField,
        isOrderAscBool,
      });

      const suppliersWithFormatting = suppliers.map((supplier) => {
        return {
          ...supplier,
          created_at__formatted: formatTimestamp(supplier.created_at),
          deleted_at__formatted: !supplier.deleted_at
            ? null
            : formatTimestamp(supplier.deleted_at),
        };
      });

      const getSortUrl = (columnKey) => {
        const isCurrentColumn = currentSort === columnKey;
        const nextOrder = isCurrentColumn && isOrderAscBool ? "desc" : "asc";
        return `?sort=${columnKey}&order=${nextOrder}`;
      };

      renderWithLayout(res, "suppliers/index", {
        title: "Suppliers Directory",
        suppliers: suppliersWithFormatting,
        currentSort,
        currentOrder: isOrderAscBool ? "asc" : "desc",
        getSortUrl,
      });
    } catch (error) {
      next(error);
    }
  },

  show: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Supplier #${req.params[0]} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const supplier = await supplierService.getById(id);

      if (!supplier) {
        const error = new Error(`Supplier #${req.params[0]} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      renderWithLayout(res, "suppliers/show", {
        title: supplier.supplier_name,
        supplier: {
          ...supplier,
          created_at__formatted: formatTimestamp(supplier.created_at),
          deleted_at__formatted: !supplier.deleted_at
            ? null
            : formatTimestamp(supplier.deleted_at),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  newForm: (req, res) => {
    renderWithLayout(res, "suppliers/new", {
      title: "New Supplier",
      errors: [],
      formData: {},
    });
  },

  create: async (req, res, next) => {
    try {
      const { supplier_name, contact_email } = req.body;

      if (!supplier_name || !supplier_name.trim()) {
        return renderWithLayout(res, "suppliers/new", {
          title: "New Supplier",
          errors: ["Supplier name is required"],
          formData: { supplier_name, contact_email },
        });
      }

      const newSupplier = await supplierService.create({
        supplier_name: supplier_name.trim(),
        contact_email: contact_email ? contact_email.trim() : null,
        created_by_user_id: req.user.id,
      });

      res.redirect(`/suppliers/${newSupplier.id}`);
    } catch (error) {
      next(error);
    }
  },

  editForm: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Supplier #${req.params[0]} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const supplier = await supplierService.getById(id);

      if (!supplier) {
        const error = new Error(`Supplier #${req.params[0]} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      renderWithLayout(res, "suppliers/edit", {
        title: supplier.supplier_name,
        supplier: {
          ...supplier,
          created_at__formatted: formatTimestamp(supplier.created_at),
          deleted_at__formatted: !supplier.deleted_at
            ? null
            : formatTimestamp(supplier.deleted_at),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Supplier #${req.params[0]} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const { supplier_name, contact_email } = req.body;

      if (!supplier_name || !supplier_name.trim()) {
        return renderWithLayout(res, "suppliers/edit", {
          title: "Edit Supplier",
          supplier: { id, supplier_name, contact_email },
          errors: ["Supplier name cannot be empty."],
        });
      }

      const updatedSupplier = await supplierService.update(id, {
        supplier_name: supplier_name.trim(),
        contact_email: contact_email ? contact_email.trim() : null,
      });

      if (!updatedSupplier) {
        const error = new Error(
          `Supplier ${id} does not exist or was deleted.`,
        );
        error.statusCode = 404;
        return next(error);
      }

      res.redirect(`/suppliers`);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Supplier #${req.params[0]} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const deletedSupplier = await supplierService.softDelete(id);

      if (!deletedSupplier) {
        const error = new Error(`Supplier #${id} could not be deleted.`);
        error.statusCode = 404;
        return next(error);
      }

      res.redirect("/suppliers");
    } catch (error) {
      next(error);
    }
  },

  restore: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Supplier #${req.params[0]} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const deletedSupplier = await supplierService.restore(id);

      if (!deletedSupplier) {
        const error = new Error(`Supplier #${id} could not be restored.`);
        error.statusCode = 404;
        return next(error);
      }

      res.redirect("/suppliers");
    } catch (error) {
      next(error);
    }
  },
};

export default supplierController;
