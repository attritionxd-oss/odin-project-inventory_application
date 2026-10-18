import productService from "#models/core/products/product.service.js";
import brandService from "#models/core/brands/brand.service.js";
import categoryService from "#models/core/categories/category.service.js";
import supplierService from "#models/core/suppliers/supplier.service.js";

export async function fetchProductDependencies({
  includeProducts = true,
  productFilters = {},
} = {}) {
  const tasks = [
    { name: "brandService", promise: brandService.getAll() },
    {
      name: "categoryService",
      promise: categoryService.getAllCategoriesWithAncestors({
        orderByField: "category_name",
        isOrderAscBool: true,
      }),
    },
    { name: "supplierService", promise: supplierService.getAll() },
  ];

  if (includeProducts) {
    tasks.push({
      name: "productService",
      promise: productService.getAll(productFilters),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.promise));

  const failedTasks = [];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      failedTasks.push({
        service: tasks[index].name,
        reason: result.reason?.message || result.reason,
      });
    }
  });

  if (failedTasks.length > 0) {
    //prettier-ignore
    const errorDetails = failedTasks
      .map((f) => `[${f.service}]`)
      .join("; ");

    const error = new Error(
      `Failed to fetch required dependencies: ${errorDetails}`,
    );
    error.statusCode = 500;
    throw error;
  }

  return {
    brands: results[0].value,
    categories: results[1].value
      .map((cat) => {
        return {
          id: cat.id,
          category_name: cat.category_name,
          parent_id: cat.parent_id,
          parent_name: cat.parent_name,
          path: cat.ancestors.map((path) => path.category_name).join(" > "),
        };
      })
      .sort((a, b) => a.path.localeCompare(b.path)),
    suppliers: results[2].value,
    products: includeProducts ? results[3].value : null,
  };
}
