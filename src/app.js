import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { authContext } from "#middleware/authContext.js";
import { requireAuth } from "#middleware/authorize.js";
import basicLogger from "#middleware/basicLogger.js";
import globalRateLimiter from "#middleware/globalRateLimiter.js";
import ipRateLimiter from "#middleware/ipRateLimiter.js";
import { handleNotFound, handleGlobalError } from "#middleware/errorHandler.js";

import indexRoutes from "#modules/index/index.routes.js";
import authRoutes from "#modules/auth/auth.routes.js";
import supplierRoutes from "#modules/supplier/supplier.routes.js";
import brandRoutes from "#modules/brand/brand.routes.js";
import categoryRoutes from "#modules/category/category.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = join(__dirname, "..", "public");

const app = express();

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

if (process.env.NODE_ENV !== "production") {
  app.use(basicLogger);
}
app.use(express.static(publicPath));
app.use(globalRateLimiter);
app.use(ipRateLimiter);
app.use(express.urlencoded({ extended: true }));

app.use(authContext);
app.use("/", authRoutes);
app.use("/", indexRoutes);
app.use("/suppliers", requireAuth, supplierRoutes);
app.use("/brands", requireAuth, brandRoutes);
app.use("/categories", requireAuth, categoryRoutes);

app.use(handleNotFound);
app.use(handleGlobalError);

export default app;
