export const renderWithLayout = (res, view, options = {}, status = 200) => {
  res.render(view, options, (err, bodyHtml) => {
    if (err)
      return res.status(500).send(err.message || "Internal Server Error");

    res.status(status).render("layouts/main", {
      ...options,
      body: bodyHtml,
    });
  });
};
