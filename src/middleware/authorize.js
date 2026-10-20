export const requireAuth = (req, res, next) => {
  if (!req.user) {
    if (req.accepts("html")) {
      return res.redirect(
        `/login?redirectTo=${encodeURIComponent(req.originalUrl)}`,
      );
    }

    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.accepts("html")) {
        return res.redirect(
          `/login?redirectTo=${encodeURIComponent(req.originalUrl)}`,
        );
      }
      return res.status(401).render("errors/401", { message: "Unauthorized" });
    }

    const hasRole =
      allowedRoles.includes(req.user.role) || req.user.role === "ADMIN";

    if (!hasRole) {
      if (req.accepts("html")) {
        const error = new Error(
          `Your role (${req.user.role}) does not have permission to access this resource.`,
        );
        error.statusCode = 403;
        return next(error);

        // for raw EJS template rendering
        // return res.status(403).render("errors/403", {
        //   title: "Access denied",
        //   message: `Your role (${req.user.role}) does not have permission to access this resource`,
        // });
      }
      return res
        .status(403)
        .json({ error: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};
