import { body } from "express-validator";

const emptyErr = "must not be empty";
const lengthErr = "must be between 1 and 255 characters";

export const validateBrand = [
  body("brand_name")
    .trim()
    .notEmpty()
    .withMessage(`Brand name ${emptyErr}.`)
    .if(body("brand_name").trim().notEmpty())
    .isLength({ min: 1, max: 255 })
    .withMessage(`Brand name ${lengthErr}.`)
    .escape(),
];
