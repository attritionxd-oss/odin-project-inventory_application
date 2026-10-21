import { userService } from "#modules/users/user.service.js";
import { matchedData } from "express-validator";

export const authController = {
  showLoginForm(req, res) {
    if (req.user) {
      return res.redirect("/");
    }

    res.render("layouts/login", {
      title: "Sign in",
      redirectTo: req.query.redirectTo || "/",
      error: req.query.error || null,
    });

    /** Alternative option
     *  If GET / was intended for a different route, and `views/auth/login.ejs`
     *  is intended to be used in `layouts/main.ejs` for when a user is not
     *  logged in.
     */
    // renderWithLayout(res, "auth/login", {
    //   title: "Sign in",
    //   redirectTo: req.query.redirectTo || "/",
    //   error: req.query.error || null,
    // });
  },

  async login(req, res, next) {
    try {
      const validationErrors = req.validationErrors;

      const { email, redirectTo } = matchedData(req);

      let targetRedirect = redirectTo || "/";

      if (!targetRedirect.startsWith("/") || targetRedirect.startsWith("//")) {
        targetRedirect = "/";
      }

      const { password } = req.body;

      if (validationErrors?.length > 0) {
        const firstError = validationErrors[0].msg;
        return res.redirect(
          `/login?error=${encodeURIComponent(firstError)}&redirectTo${encodeURIComponent(targetRedirect)}`,
        );
      }

      const user = await userService.getByEmail(email);

      if (!user) {
        return res.redirect(
          `/login?error=${encodeURIComponent("Invalid email or password")}&redirectTo=${encodeURIComponent(targetRedirect)}`,
        );
      }

      let isPasswordValid = false;

      if (process.env.ENABLE_MOCK_AUTH === "true") {
        isPasswordValid = password === user.password_hash;
      } else {
        isPasswordValid = false;
      }

      if (!isPasswordValid) {
        return res.redirect(
          `/login?error=${encodeURIComponent("Invalid email or password")}&redirectTo=${encodeURIComponent(targetRedirect)}`,
        );
      }

      res.setHeader(
        "Set-Cookie",
        `activeUserId=${user.id}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
      );

      res.redirect(targetRedirect);
    } catch (error) {
      next(error);
    }
  },

  logout(req, res) {
    res.clearCookie("activeUserId");
    res.redirect("/login");
  },
};
