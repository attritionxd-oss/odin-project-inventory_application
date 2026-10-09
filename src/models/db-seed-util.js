import { Client } from "pg";

export default async function dbSeedUtil(query, tableName = "") {
  // eslint-disable-next-line no-console
  console.log(`seeding${tableName === "" ? "" : " " + tableName}...`);

  const connectionString =
    process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL_POOLED or DATABASE_URL environment variable",
    );
  }

  const isProduction = process.env.NODE_ENV === "production";

  const client = new Client({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: true } : false,
  });
  await client.connect();

  try {
    await client.query(query);
  } finally {
    client.end();
  }

  // eslint-disable-next-line no-console
  console.log("done");
}
