import { body } from "express-validator";

const emptyErr = "must not be empty";
const lengthErr = "must be between 1 and 255 characters";
const intErr = "must be an integer";

export const validateCategory = [
  body("category_name")
    .trim()
    .notEmpty()
    .withMessage(`Category name ${emptyErr}`)
    .if(body("category_name").trim().notEmpty())
    .isLength({ min: 1, max: 255 })
    .withMessage(`Category name ${lengthErr}`)
    .escape(),
  body("parent_id")
    .trim()
    .if(body("parent_id").trim().notEmpty())
    .isInt()
    .withMessage(`Parent ID ${intErr}`)
    .toInt(),
];
