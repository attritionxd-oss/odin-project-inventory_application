import { body } from "express-validator";

const emptyErr = "must not be empty";
const lengthErr = "must be between 1 and 255 characters";
const emailErr = "must be a valid email";

export const validateSupplier = [
  body("supplier_name")
    .trim()
    .notEmpty()
    .withMessage(`Supplier name ${emptyErr}.`)
    .if(body("supplier_name").trim().notEmpty())
    .isLength({ min: 1, max: 255 })
    .withMessage(`Supplier name ${lengthErr}.`)
    .escape(),
  body("contact_email")
    .trim()
    .if(body("contact_email").trim().notEmpty())
    .isEmail()
    .withMessage(`Email ${emailErr}.`)
    .escape(),
];
