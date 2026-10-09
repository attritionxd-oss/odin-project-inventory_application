import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing DATABASE_URL_POOLED or DATABASE_URL environment variable",
  );
}

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: true } : false,
});

export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1;");
    // eslint-disable-next-line no-console
    console.log("Database connection established.");
  } finally {
    client.release();
  }
};

export const closeDb = async () => {
  // eslint-disable-next-line no-console
  console.log("Closing database connection pool...");
  await pool.end();
  // eslint-disable-next-line no-console
  console.log("Database connection pool closed.");
};
