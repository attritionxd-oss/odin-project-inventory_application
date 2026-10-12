import { renderWithLayout } from "#utils/renderHelper.js";

export const indexController = {
  showDashboard(req, res) {
    if (req.user) {
      renderWithLayout(res, "partials/dashboard", {
        title: "Dashboard",
        error: req.query.error || null,
      });
    } else {
      return res.redirect("/login");
    }
  },
};
