import { renderWithLayout } from "#utils/renderHelper.js";
import { fetchProductDependencies } from "#modules/product/product.helper.js";

export const indexController = {
  showDashboard: async (req, res) => {
    const data = await fetchProductDependencies({ includeProducts: true });

    const mostRecentProds = data.products
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 3)
      .map((prod) => prod.product_name);

    const topBrands = Object.entries(
      data.products.reduce((acc, prod) => {
        const brand = prod?.brand_name ?? "Unknown";
        acc[brand] = (acc[brand] || 0) + 1;
        return acc;
      }, {}),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const topCategories = Object.entries(
      data.products.reduce((acc, prod) => {
        const cat = prod?.category_name ?? "Unknown";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const topSuppliers = Object.entries(
      data.products.reduce((acc, prod) => {
        const sup = prod?.supplier_name ?? "Unknown";
        acc[sup] = (acc[sup] || 0) + 1;
        return acc;
      }, {}),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    if (req.user) {
      renderWithLayout(res, "partials/dashboard", {
        title: "Dashboard",
        data: {
          ...data,
          mostRecentProds,
          topBrands,
          topCategories,
          topSuppliers,
        },
        error: req.query.error || null,
      });
    } else {
      return res.redirect("/login");
    }
  },
};
