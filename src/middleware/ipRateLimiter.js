import { ASSET_REGEX } from "#shared/utils/asset-regex.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_IP_REQUESTS = 100;

const ipStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipStore.entries()) {
    if (now - record.startTime > WINDOW_MS) {
      ipStore.delete(ip);
    }
  }
}, WINDOW_MS);

export default function ipRateLimiter(req, res, next) {
  const clientIp = req.ip || req.socket.remoteAddress;
  const now = Date.now();

  const record = ipStore.get(clientIp);

  if (!record) {
    ipStore.set(clientIp, { count: 1, startTime: now });
    return next();
  }

  if (now - record.startTime > WINDOW_MS) {
    ipStore.set(clientIp, { count: 1, startTime: now });
    return next();
  }

  if (record.count >= MAX_IP_REQUESTS) {
    return res.status(429).render("layouts/error-layout", {
      title: "429 Too Many Requests",
      message: "Too many requests. Please try again later.",
    });
  }

  if (ASSET_REGEX.test(req.path)) {
    return next();
  }

  record.count++;

  next();
}
