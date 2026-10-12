import { renderWithLayout } from "#utils/renderHelper.js";

export const handleNotFound = (req, res) => {
  const statusCode = 404;
  const errorDetails = {
    statusCode,
    title: "Page Not Found",
    message: `The resource at "${req.originalUrl}" could not be found.`,
  };

  if (req.accepts("json") && !req.accepts("html")) {
    return res.status(statusCode).json({
      error: {
        code: statusCode,
        message: errorDetails.message,
      },
    });
  }

  renderWithLayout(
    res,
    "errors/error",
    {
      title: `${statusCode} - ${errorDetails.title}`,
      ...errorDetails,
    },
    statusCode,
  );
};

export const handleGlobalError = (err, req, res, next) => {
  console.error("Unhandled Server Error", err);

  const statusCode = err.status || err.statusCode || 500;
  const errorDetails = {
    statusCode,
    title: statusCode === 403 ? "Forbidden" : "Internal Server Error",
    message: err.message || "An unexpected error occurred in the server.",
  };

  if (req.accepts("json") && !req.accepts("html")) {
    return res.status(statusCode).json({
      error: {
        code: statusCode,
        message: errorDetails.message,
      },
    });
  }

  renderWithLayout(
    res,
    "errors/error",
    {
      title: `${statusCode} - ${errorDetails.title}`,
      ...errorDetails,
    },
    statusCode,
  );
};
