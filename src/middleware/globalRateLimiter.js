import { ASSET_REGEX } from "#shared/utils/asset-regex.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_GLOBAL_REQUESTS = 1000;

let globalRequestCount = 0;

setInterval(() => {
  globalRequestCount = 0;
}, WINDOW_MS);

export default function globalRateLimiter(req, res, next) {
  if (globalRequestCount >= MAX_GLOBAL_REQUESTS) {
    return res.status(429).render("layouts/error-layout", {
      title: "429 Too Many Requests",
      message: "Server busy: Too many requests. Please try again later.",
    });
  }

  if (ASSET_REGEX.test(req.path)) {
    return next();
  }

  globalRequestCount++;

  next();
}
