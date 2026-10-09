/* eslint-disable no-console */
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const SCHEMA_TABLES = {
  suppliers: /* sql */ `
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      supplier_name VARCHAR(255) NOT NULL,
      contact_email VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ DEFAULT NULL
    );
  `,

  brands: /* sql */ `
    CREATE TABLE IF NOT EXISTS brands (
      id SERIAL PRIMARY KEY,
      brand_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ DEFAULT NULL
    );
  `,

  categories: /* sql */ `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      category_name VARCHAR(100) NOT NULL,
      parent_id INT REFERENCES categories(id) ON DELETE SET NULL
    );
  `,

  products: /* sql */ `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      brand_id INT REFERENCES brands(id) ON DELETE SET NULL,
      supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
      category_id INT REFERENCES categories(id) ON DELETE SET NULL,
      product_name VARCHAR(255) NOT NULL,
      product_description TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ DEFAULT NULL
    );
  `,

  product_variations: /* sql */ `
    CREATE TABLE IF NOT EXISTS product_variations (
      id SERIAL PRIMARY KEY,
      product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      sku VARCHAR(100) UNIQUE NOT NULL,
      attributes JSONB NOT NULL DEFAULT '{}',
      /* e.g. {"color": "Red", "size": "XL"}  */
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `,

  line_items: /* sql */ `
    CREATE TABLE IF NOT EXISTS line_items (
      id SERIAL PRIMARY KEY,
      variation_id INT NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,
      stock_quantity INT NOT NULL DEFAULT 0,
      is_online_only BOOLEAN DEFAULT FALSE,
      is_instore_only BOOLEAN DEFAULT FALSE,
      cost_price NUMERIC(10, 2) NOT NULL,
      suggested_retail_price NUMERIC(10, 2) NOT NULL,
      store_price NUMERIC(10, 2) NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `,

  stock_movements: /* sql */ `
    CREATE TABLE IF NOT EXISTS stock_movements (
      id SERIAL PRIMARY KEY,
      line_item_id INT NOT NULL REFERENCES line_items(id),
      quantity_change INT NOT NULL, /* Positive (restock) or negative (sale/damage) */
      reason VARCHAR(50) NOT NULL, /* 'PURCHASE_ORDER', 'DAMAGED', 'INVENTORY_COUNT', 'SALE', */
      reference_id VARCHAR(100), 
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `,
};

export async function seedSchema() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    for (const tableName in SCHEMA_TABLES) {
      const sqlQuery = SCHEMA_TABLES[tableName];
      await client.query(sqlQuery);
      console.log(`Verified table: ${tableName}`);
    }

    await client.query("COMMIT;");
    console.log("Schema creation complete.");
  } catch (error) {
    console.error("Failed to seed database schema:", error);
    throw error;
  } finally {
    client.release();
  }
}

const isDirectExecution = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectExecution) {
  seedSchema()
    .then(() => pool.end())
    // eslint-disable-next-line no-process-exit
    .catch(() => process.exit(1));
}

export default SCHEMA_TABLES;
