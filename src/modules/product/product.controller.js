import { body, query, validationResult, matchedData } from "express-validator";
import { parseId } from "#utils/parse-id.js";
import { fetchProductDependencies } from "./product.helper.js";
import productService from "#models/core/products/product.service.js";
import { renderWithLayout } from "#utils/renderHelper.js";
import { formatTimestamp } from "#utils/formatTimestamp.js";

const emptyErr = "must not be empty";
const lengthErr = "must be between 1 and 350 characters";
const intErr = "must be an integer";

export const validateProductFilter = [
  query("brand_id")
    .optional({ values: "falsy" })
    .trim()
    .if(query("brand_id").trim().notEmpty())
    .isInt()
    .withMessage(`brand_id ${intErr}`)
    .toInt(),
  query("supplier_id")
    .optional({ values: "falsy" })
    .trim()
    .if(query("supplier_id").trim().notEmpty())
    .isInt()
    .withMessage(`supplier_id ${intErr}`)
    .toInt(),
  query("category_id")
    .optional({ values: "falsy" })
    .trim()
    .if(query("category_id").trim().notEmpty())
    .isInt()
    .withMessage(`category_id ${intErr}`)
    .toInt(),
  query("include_deleted").optional().isBoolean().toBoolean(),
  query("sort")
    .optional()
    .trim()
    .if(query("sort").notEmpty())
    .isIn(["id", "brand", "supplier", "category", "name", "created", "deleted"])
    .withMessage("sort must be one of the allowed values")
    .escape(),
  query("order")
    .optional()
    .trim()
    .if(query("order").notEmpty())
    .isIn(["asc", "desc"])
    .escape(),
];

export const validateProduct = [
  body("product_name")
    .trim()
    .notEmpty()
    .withMessage(`Product name ${emptyErr}`)
    .if(body("product_name").trim().notEmpty())
    .isLength({ min: 1, max: 350 })
    .withMessage(`Product name ${lengthErr}`)
    .escape(),
  body("product_description")
    .trim()
    .if(body("product_description").trim().notEmpty())
    .isLength({ min: 1, max: 350 })
    .withMessage(`Product description ${lengthErr}`)
    .escape(),
  body("brand_id")
    .trim()
    .if(body("brand_id").trim().notEmpty())
    .isInt()
    .toInt()
    .withMessage(`Brand ID ${intErr}`),
  body("category_id")
    .trim()
    .if(body("category_id").trim().notEmpty())
    .isInt()
    .toInt()
    .withMessage(`Category ID ${intErr}`),
  body("supplier_id")
    .trim()
    .if(body("supplier_id").trim().notEmpty())
    .isInt()
    .toInt()
    .withMessage(`Supplier ID ${intErr}`),
];

export const productController = {
  index: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.query = {};
      }

      const isRoleAuthorized =
        res.locals?.currentUser.role === "ADMIN" ||
        res.locals?.currentUser.role === "ANALYST";

      const {
        brand_id,
        supplier_id,
        category_id,
        include_deleted: includeDeleted,
        sort: sortQuery,
        order,
      } = matchedData(req);

      const allowedSortFields = {
        id: "id",
        brand: "brand",
        supplier: "supplier",
        category: "category",
        name: "name",
        created: "created",
        deleted: "deleted",
      };

      const orderQuery = order?.toLowerCase();

      const currentSort = allowedSortFields[sortQuery] ? sortQuery : "name";
      const isOrderAscBool = orderQuery === "desc" ? false : true;

      const { brands, categories, suppliers, products } =
        await fetchProductDependencies({
          includeProducts: true,
          productFilters: {
            brand_id,
            supplier_id,
            category_id,
            includeDeleted,
            orderByField: currentSort,
            isOrderAscBool,
          },
        });

      const productsWithFormatting = products.map((product) => {
        return {
          ...product,
          created_at__formatted: !product.created_at
            ? null
            : formatTimestamp(product.created_at, { variant: "dateOnly" }),
          deleted_at__formatted: !product.deleted_at
            ? null
            : formatTimestamp(product.deleted_at, { variant: "dateOnly" }),
        };
      });

      const getSortUrl = (columnKey) => {
        const queryParams = new URLSearchParams();

        if (brand_id) queryParams.set("brand_id", brand_id);
        if (supplier_id) queryParams.set("supplier_id", supplier_id);
        if (category_id) queryParams.set("category_id", category_id);
        if (includeDeleted) queryParams.set("include_deleted", includeDeleted);

        const isCurrentColumn = currentSort === columnKey;
        const nextOrder = isCurrentColumn && isOrderAscBool ? "desc" : "asc";

        queryParams.set("sort", columnKey);
        queryParams.set("order", nextOrder);

        return `?${queryParams.toString()}`;
      };

      renderWithLayout(res, "products/index", {
        title: "Product directory",
        products: productsWithFormatting,
        brands,
        categories,
        suppliers,
        selectedFilters: {
          brand_id,
          supplier_id,
          category_id,
          include_deleted: includeDeleted,
        },
        currentSort,
        currentOrder: isOrderAscBool ? "asc" : "desc",
        getSortUrl,
        isRoleAuthorized,
      });
    } catch (error) {
      next(error);
    }
  },

  show: async (req, res, next) => {
    try {
      const id = parseId(req.params[0]);
      if (!id) {
        const error = new Error(`Product #${id} was not found`);
        error.statusCode = 404;
        return next(error);
      }

      const [product, { brands, categories, suppliers }] = await Promise.all([
        productService.getById(id),
        fetchProductDependencies({ includeProducts: false }),
      ]);

      if (!product) {
        const error = new Error(`Product #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const brand = brands.find(
        (b) => Number(b.id) === Number(product.brand_id),
      );
      const category = categories.find(
        (c) => Number(c.id) === Number(product.category_id),
      );
      const supplier = suppliers.find(
        (s) => Number(s.id) === Number(product.supplier_id),
      );

      renderWithLayout(res, "products/show", {
        title: product.product_name,
        product,
        brand,
        category,
        supplier,
      });
    } catch (error) {
      next(error);
    }
  },

  newForm: async (req, res, next) => {
    try {
      const { brands, categories, suppliers } = await fetchProductDependencies({
        includeProducts: false,
      });

      renderWithLayout(res, "products/new", {
        title: "New Product",
        errors: [],
        formData: {},
        brands,
        categories,
        suppliers,
      });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const { brands, categories, suppliers } = await fetchProductDependencies({
        includeProducts: false,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return renderWithLayout(res, "products/new", {
          title: "New Product",
          errors: errors.array(),
          formData: req.body,
          brands,
          categories,
          suppliers,
        });
      }

      const {
        product_name,
        product_description,
        brand_id,
        category_id,
        supplier_id,
      } = matchedData(req);

      const newProduct = await productService.create({
        product_name,
        product_description,
        brand_id: parseId(brand_id),
        category_id: parseId(category_id),
        supplier_id: parseId(supplier_id),
      });
      if (!newProduct || !newProduct.id || newProduct.rowCount === 0) {
        console.warn("[CREATE PRODUCT] Failed");
        console.warn(
          `Path: ${req.path}; Body: ${{
            product_name,
            product_description,
            brand_id,
            category_id,
            supplier_id,
          }}`,
        );
      }

      res.redirect(`/products/${newProduct.rows[0].id}`);
    } catch (error) {
      console.error("[CREATE PRODUCT FAILED]", error.mesage, {
        code: error.code,
      });
      next(error);
    }
  },

  editForm: async (req, res, next) => {
    try {
      const id = parseId(req.params[0]);
      if (!id) {
        const error = new Error(`Product #${id} was not found`);
        error.statusCode = 404;
        return next(error);
      }

      const [product, { brands, categories, suppliers }] = await Promise.all([
        productService.getById(id),
        fetchProductDependencies({ includeProducts: false }),
      ]);

      if (!product) {
        const error = new Error(`Product #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      renderWithLayout(res, "products/edit", {
        title: `Edit ${product.product_name}`,
        product,
        brands,
        categories,
        suppliers,
        errors: [],
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = parseId(req.params[0]);
      if (!id) {
        const error = new Error(`Product #${id} was not found`);
        error.statusCode = 404;
        return next(error);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const { brands, categories, suppliers } =
          await fetchProductDependencies({ includeProducts: false });

        return renderWithLayout(res, "products/edit", {
          title: `Edit ${req.body.product_name}`,
          product: { id, ...req.body },
          brands,
          categories,
          suppliers,
          errors: errors.array(),
        });
      }

      const {
        product_name,
        product_description,
        brand_id,
        category_id,
        supplier_id,
      } = matchedData(req);

      const updatedProduct = await productService.update(id, {
        product_name,
        product_description,
        brand_id: parseId(brand_id),
        category_id: parseId(category_id),
        supplier_id: parseId(supplier_id),
      });
      if (!updatedProduct) {
        const error = new Error(
          `Product #${id} was not found or has been deleted.`,
        );
        error.statusCode = 404;
        return next(error);
      }

      res.redirect(`/products`);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Product #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const deletedProduct = await productService.softDelete(id);

      if (!deletedProduct) {
        const error = new Error(`Product #${id} could not be deleted.`);
        error.statusCode = 404;
        return next(error);
      }

      res.redirect("/products");
    } catch (error) {
      next(error);
    }
  },

  restore: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Product #${req.params[0]} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const restoredProduct = await productService.restore(id);

      if (!restoredProduct) {
        const error = new Error(`Product #${id} could not be restored.`);
        error.statusCode = 404;
        return next(error);
      }

      res.redirect("/products");
    } catch (error) {
      next(error);
    }
  },
};
