import { body, query } from "express-validator";

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
