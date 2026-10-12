import { userService } from "#modules/users/user.service.js";
import { getCookieValue } from "#utils/getCookieValue.js";

export const authContext = async (req, res, next) => {
  try {
    const rawCookieHeader = req.headers.cookie;

    const activeUserId = getCookieValue("activeUserId", rawCookieHeader);
    req.query.mockUserId || null;

    if (activeUserId) {
      const user = await userService.getById(activeUserId);
      req.user = user || null;
    } else {
      req.user = null;
    }

    res.locals.currentUser = req.user;
    res.locals.isAuthenticated = Boolean(req.user);

    next();
  } catch (error) {
    console.error("Error hydrating auth context:", error);
    req.user = null;
    res.locals.currentUser = null;
    res.locals.isAuthenticated = false;
    next();
  }
};
