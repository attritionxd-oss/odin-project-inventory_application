import { ASSET_REGEX } from "#utils/asset-regex.js";

const basicLogger = (req, res, next) => {
  if (ASSET_REGEX.test(req.path)) {
    return next();
  }

  if (req.method === "GET" || req.method === "POST") {
    const dateNow = new Date();
    dateNow.setUTCMilliseconds(0);
    // eslint-disable-next-line no-console
    console.log(`[${dateNow.toISOString()}] Started ${req.method} ${req.path}`);
  }
  next();
};

export default basicLogger;
