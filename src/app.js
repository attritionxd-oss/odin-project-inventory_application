import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import basicLogger from "#shared/middleware/basicLogger.js";
import globalRateLimiter from "#shared/middleware/globalRateLimiter.js";
import ipRateLimiter from "#shared/middleware/ipRateLimiter.js";

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

app.get("/", (req, res) => {
  res.send(`Connected to ${req.path}`);
});

export default app;
