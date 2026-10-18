import { body, validationResult, matchedData } from "express-validator";
import categoryService from "#models/core/categories/category.service.js";
import { renderWithLayout } from "#utils/renderHelper.js";
import { parseId } from "#utils/parse-id.js";

const emptyErr = "must not be empty";
const lengthErr = "must be between 1 and 255 characters";
const intErr = "must be an integer";

const validateCategory = [
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
    .withMessage(`Parent ID ${intErr}`),
];

const categoryController = {
  index: async (req, res, next) => {
    try {
      const isRoleAuthorized =
        res.locals?.currentUser.role === "ADMIN" ||
        res.locals?.currentUser.role === "ANALYST";

      const allowedSortFields = {
        id: "id",
        name: "category_name",
        parent_id: "parent_id",
        parent: "parent_name",
      };

      const sortQuery = req.query.sort;
      const orderQuery = req.query.order?.toLowerCase();

      const currentSort = allowedSortFields[sortQuery] ? sortQuery : "id";
      const orderByField = allowedSortFields[currentSort];
      const isOrderAscBool = orderQuery === "desc" ? false : true;

      const categories = await categoryService.getAllCategoriesWithAncestors({
        includeDeleted: true,
        orderByField,
        isOrderAscBool,
      });

      const getSortUrl = (columnKey) => {
        const isCurrentColumn = currentSort === columnKey;
        const nextOrder = isCurrentColumn && isOrderAscBool ? "desc" : "asc";
        return `?sort=${columnKey}&order=${nextOrder}`;
      };

      const allCategoriesWithAncestorsFormatted = categories.map((cat) => {
        const fullPath = cat.ancestors
          .filter((c) => c.category_name !== cat.category_name)
          .map((path) => path.category_name);
        return {
          id: cat.id,
          category_name: cat.category_name,
          parent_id: cat.parent_id,
          parent_name: cat.parent_name,
          path: fullPath.join(" > ") || "No parent (Top-level category)",
        };
      });

      renderWithLayout(res, "categories/index", {
        title: "Categories Directory",
        categories: allCategoriesWithAncestorsFormatted,
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
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Category #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const breadcrumbs = await categoryService.getCategoryAncestors(id);
      if (!breadcrumbs.length) {
        const error = new Error(`Category path for #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }
      const breadcrumbsPath = breadcrumbs
        .map((cat) => {
          return cat.category_name;
        })
        .slice(0, -1)
        .join(" > ");

      const currentCategory = breadcrumbs[breadcrumbs.length - 1];

      renderWithLayout(res, "categories/show", {
        title: currentCategory.category_name,
        category: currentCategory,
        breadcrumbsPath,
      });
    } catch (error) {
      next(error);
    }
  },

  newForm: async (req, res, next) => {
    try {
      const allCategoriesWithAncestors =
        await categoryService.getAllCategoriesWithAncestors({
          orderByField: "category_name",
          isOrderAscBool: true,
        });
      if (!allCategoriesWithAncestors) {
        const error = new Error("Error getting Category Tree");
        error.statusCode = 404;
        return next(error);
      }
      const allCategoriesWithAncestorsFormatted = allCategoriesWithAncestors
        .map((cat) => {
          return {
            id: cat.id,
            category_name: cat.category_name,
            parent_id: cat.parent_id,
            parent_name: cat.parent_name,
            path: cat.ancestors.map((path) => path.category_name).join(" > "),
          };
        })
        .sort((a, b) => a.path.localeCompare(b.path));

      renderWithLayout(res, "categories/new", {
        title: "New Category",
        errors: [],
        formData: {},
        categories: allCategoriesWithAncestorsFormatted,
      });
    } catch (error) {
      next(error);
    }
  },

  create: [
    validateCategory,
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return renderWithLayout(res, "categories/new", {
          title: "New Category",
          errors: errors.array(),
          formData: req.body,
        });
      }

      const { category_name, parent_id } = matchedData(req);

      try {
        const newCategory = await categoryService.create({
          category_name,
          parent_id: parseId(parent_id),
        });

        res.redirect(`/categories/${newCategory.id}`);
      } catch (error) {
        next(error);
      }
    },
  ],

  editForm: async (req, res, next) => {
    try {
      const id = parseId(req.params[0]);
      if (!id) {
        const error = new Error(`Category #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const allCategoriesWithAncestors =
        await categoryService.getAllCategoriesWithAncestors({
          orderByField: "category_name",
          isOrderAscBool: true,
        });
      if (!allCategoriesWithAncestors) {
        const error = new Error("Error getting Category Tree");
        error.statusCode = 404;
        return next(error);
      }

      const targetCategoryRaw = allCategoriesWithAncestors.find(
        (cat) => cat.id === id,
      );
      if (!targetCategoryRaw) {
        const error = new Error(`Category #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const descendantIds = await categoryService.getDescendantIds(id);
      const invalidParentIds = new Set([id, ...descendantIds]);

      const validParentOptions = allCategoriesWithAncestors
        .filter((cat) => !invalidParentIds.has(cat.id))
        .map((cat) => {
          const fullPath = cat.ancestors.map((path) => path.category_name);
          return {
            id: cat.id,
            category_name: cat.category_name,
            parent_id: cat.parent_id,
            path: fullPath.join(" > "),
          };
        })
        .sort((a, b) => a.path.localeCompare(b.path));

      renderWithLayout(res, "categories/edit", {
        title: `Edit ${targetCategoryRaw.category_name}`,
        category: targetCategoryRaw,
        categories: validParentOptions,
        errors: [],
      });
    } catch (error) {
      next(error);
    }
  },

  update: [
    validateCategory,
    async (req, res, next) => {
      try {
        const id = parseId(req.params[0]);
        if (!id) {
          const error = new Error(`Category #${id} was not found.`);
          error.statusCode = 404;
          return next(error);
        }

        const allCategoriesWithAncestors =
          await categoryService.getAllCategoriesWithAncestors({
            orderByField: "category_name",
            isOrderAscBool: true,
          });
        if (!allCategoriesWithAncestors) {
          const error = new Error("Error getting Category Tree");
          error.statusCode = 404;
          return next(error);
        }

        const targetCategoryRaw = allCategoriesWithAncestors.find(
          (cat) => cat.id === id,
        );
        if (!targetCategoryRaw) {
          const error = new Error(`Category #${id} was not found.`);
          error.statusCode = 404;
          return next(error);
        }

        const descendantIds = await categoryService.getDescendantIds(id);
        const invalidParentIds = new Set([id, ...descendantIds]);

        const validParentOptions = allCategoriesWithAncestors
          .filter((cat) => !invalidParentIds.has(cat.id))
          .map((cat) => {
            const fullPath = cat.ancestors.map((path) => path.category_name);
            return {
              id: cat.id,
              category_name: cat.category_name,
              parent_id: cat.parent_id,
              path: fullPath.join(" > "),
            };
          })
          .sort((a, b) => a.path.localeCompare(b.path));

        const { category_name, parent_id } = matchedData(req);
        const parsedParentId = parseId(parent_id);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return renderWithLayout(res, "categories/edit", {
            title: `Edit ${category_name}`,
            category: { ...targetCategoryRaw, parsedParentId },
            categories: validParentOptions,
          });
        }

        if (parsedParentId === id) {
          const error = new Error("A category cannot be its own parent");
          error.statusCode = 400;
          return next(error);
        }

        if (parsedParentId) {
          const descendantIds = await categoryService.getDescendantIds(id);
          if (descendantIds.includes(parsedParentId)) {
            const error = new Error(
              "Cannot set a descendant category as a parent (circular dependency).",
            );
            error.statusCode = 400;
            return next(error);
          }
        }

        const updatedCategory = await categoryService.update(id, {
          category_name: category_name,
          parent_id: parsedParentId,
        });
        if (!updatedCategory) {
          const error = new Error(`Category #${id} was not found.`);
          error.statusCode = 404;
          return next(error);
        }

        res.redirect("/categories");
      } catch (error) {
        next(error);
      }
    },
  ],

  delete: async (req, res, next) => {
    try {
      const id = req.params[0];
      if (!id) {
        const error = new Error(`Category #${id} was not found.`);
        error.statusCode = 404;
        return next(error);
      }

      const deleteCategory = await categoryService.delete(id);
      if (!deleteCategory) {
        const error = new Error(`Category #${id} could not be deleted.`);
        error.statusCode = 404;
        return next(error);
      }

      res.redirect("/categories");
    } catch (error) {
      next(error);
    }
  },
};

export default categoryController;
