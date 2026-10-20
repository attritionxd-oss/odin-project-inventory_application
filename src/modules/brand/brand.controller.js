import { validationResult, matchedData } from "express-validator";
import brandService from "#models/core/brands/brand.service.js";
import { renderWithLayout } from "#utils/renderHelper.js";
import { formatTimestamp } from "#utils/formatTimestamp.js";

const brandController = {
  index: async (req, res, next) => {
    try {
      const allowedSortFields = {
        id: "id",
        name: "brand_name",
        created: "created_at",
        deleted: "deleted_at",
      };

      const sortQuery = req.query.sort;
      const orderQuery = req.query.order?.toLowerCase();

      const currentSort = allowedSortFields[sortQuery] ? sortQuery : "name";
      const orderByField = allowedSortFields[currentSort];
      const isOrderAscBool = orderQuery === "desc" ? false : true;

      const brands = await brandService.getAll({
        includeDeleted: true,
        orderByField,
        isOrderAscBool,
      });

      const brandsWithFormatting = brands.map((brand) => {
        return {
          ...brand,
          created_at__formatted: formatTimestamp(brand.created_at),
          deleted_at__formatted: !brand.deleted_at
            ? null
            : formatTimestamp(brand.deleted_at),
        };
      });

      const getSortUrl = (columnKey) => {
        const isCurrentColumn = currentSort === columnKey;
        const nextOrder = isCurrentColumn && isOrderAscBool ? "desc" : "asc";
        return `?sort=${columnKey}&order=${nextOrder}`;
      };

      renderWithLayout(res, "brands/index", {
        title: "Brands Directory",
        brands: brandsWithFormatting,
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
        const error = new Error(`Brand #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const brand = await brandService.getById(id);

      if (!brand) {
        const error = new Error(`Brand ${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      renderWithLayout(res, "brands/show", {
        title: brand.brand_name,
        brand: {
          ...brand,
          created_at__formatted: formatTimestamp(brand.created_at),
          deleted_at__formatted: formatTimestamp(brand.deleted_at),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  newForm: (req, res) => {
    renderWithLayout(res, "brands/new", {
      title: "New Brand",
      errors: [],
      formData: {},
    });
  },

  create: async (req, res, next) => {
    const validationErrors = req.validationErrors;
    if (validationErrors?.length > 0) {
      return renderWithLayout(res, "brands/new", {
        title: "New Brand",
        errors: validationErrors,
        formData: req.body,
      });
    }

    const { brand_name } = req.body;

    try {
      const newBrand = await brandService.create({
        brand_name: brand_name.trim(),
      });

      res.redirect(`/brands/${newBrand.id}`);
    } catch (error) {
      next(error);
    }
  },

  editForm: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Brand #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const brand = await brandService.getById(id);
      if (!brand) {
        const error = new Error(`Brand #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      renderWithLayout(res, "brands/edit", {
        title: `Edit: ${brand.brand_name}`,
        brand: {
          ...brand,
          created_at__formatted: formatTimestamp(brand.created_at),
          deleted_at__formatted: !brand.deleted_at
            ? null
            : formatTimestamp(brand.deleted_at),
        },
        errors: [],
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Brand #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const brand = await brandService.getById(id);
      if (!brand) {
        const error = new Error(`Brand #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const { brand_name } = matchedData(req);
      const validationErrors = req.validationErrors;
      if (validationErrors?.length > 0) {
        return renderWithLayout(res, "brands/edit", {
          title: `Edit: ${brand_name}`,
          brand: {
            ...brand,
            id,
            brand_name,
            created_at__formatted: formatTimestamp(brand.created_at),
            deleted_at__formatted: !brand.deleted_at
              ? null
              : formatTimestamp(brand.deleted_at),
          },
          errors: validationErrors,
        });
      }

      const updatedBrand = await brandService.update(id, {
        brand_name: brand_name,
      });
      if (!updatedBrand) {
        const error = new Error(`Brand ${id} does not exist or was deleted.`);
        error.statusCode = 404;
        return next(error);
      }

      res.redirect("/brands");
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Brand #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const deletedBrand = await brandService.softDelete(id);
      if (!deletedBrand) {
        const error = new Error(`Brand #${id} could not be deleted.`);
        error.statusCode = 404;
        return next(error);
      }

      res.redirect("/brands");
    } catch (error) {
      next(error);
    }
  },

  restore: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Brand #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const restoredBrand = await brandService.restore(id);
      if (!restoredBrand) {
        const error = new Error(`Brand #${id} could not be restored.`);
        error.statusCode = 404;
        return next(error);
      }

      res.redirect("/brands");
    } catch (error) {
      next(error);
    }
  },
};

export default brandController;
