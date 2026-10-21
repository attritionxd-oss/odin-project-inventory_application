/* eslint-disable no-console */
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const TABLES = {
  truncate: /* sql */ `
    TRUNCATE TABLE suppliers RESTART IDENTITY CASCADE;
  `,

  suppliers: /* sql */ `
    INSERT INTO suppliers (supplier_name, contact_email, created_at)
    VALUES
      ('Logistics, Inc.', 'sales@logistics.com', '2026-10-13 06:56:34.477482+00'),
      ('Teleported Wares Corporation', 'sales@teleportedwares.com', '2026-10-13 07:03:50.03129+00'),
      ('Warehouse Global Ltd.', 'sales@warehouse.com', '2026-10-13 07:04:55.679515+00');
  `,

  brands: /* sql */ `
    INSERT INTO brands (brand_name, created_at)
    VALUES
      ('Remotely', '2026-10-06 09:18:19.849675+00'),
      ('Imaginary', '2026-10-06 09:18:19.849675+00'),
      ('Wazzap', '2026-10-06 09:18:19.849675+00'),
      ('GeneralPharma', '2026-10-14 00:19:12.600829+00'),
      ('Illusory', '2026-10-15 13:41:11.632636+00');
  `,

  categories: /* sql */ `
    INSERT INTO categories (category_name)
    VALUES
      ('Electronics'),
      ('Apparel');

    INSERT INTO categories (category_name, parent_id)
    VALUES
      ('Mobile Devices', 1),
      ('Mobile Phones', 3),
      ('Mobile Accessories', 3),
      ('Smartphones', 3),
      ('Phone chargers', 5),
      ('Charger cables', 7),
      ('Charger cables (new)', 8),
      ('Charger cables (refurbished)', 8),
      ('Mobile Wi-Fi', 3),
      ('Clothing', 2),
      ('Hats', 2),
      ('Shirts', 12),
      ('Men''s shirts',  12),
      ('Women''s tops',  12);
  `,

  products: /* sql */ `
    INSERT INTO products (brand_id, supplier_id, category_id, product_name, product_description, created_at)
    VALUES
      (2, 2, 6, 
        'Imaginary Phone 14', 
        'The imaginary phone of the future, version 14!', 
        '2026-10-17 05:58:15.129502+00'
      ),
      (1, 1, 6, 
        'RemotePhone XVI', 
        'The worlds first Remote Phone! Now you don&#x27;t have to carry a phone around, just use it remotely!', 
        '2026-10-18 08:44:00.873752+00'
      ),
      (5, 3, 6, 
        'IllusionPhone', 
        'IllusionPhone, a mobile phone that isn&#x27;t there but works as if it is there... just in your imagination. Send imaginary messages, take imaginary photos, conduct imaginary bank transactions with this phone.', 
        '2026-10-18 11:32:22.219972+00'
      ),
      (2, 2, 6, 
        'Imaginary Phone 15', 
        'The imaginary phone of the future, version 15!', 
        '2026-10-19 16:02:12.771306+00'
      ),
      (2, 2, 6, 
        'Imaginary Phone 16', 
        'The imaginary phone of the future, version 16!', 
        '2026-10-19 16:02:51.262406+00'
      ),
      (1, 1, 6, 
        'RemotePhone XVII', 
        'The worlds first Remote Phone! Now you don&#x27;t have to carry a phone around, just use it remotely!', 
        '2026-10-19 21:30:36.216575+00' 
      );
  `,
};

export async function seedSchema() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    await client.query(/* sql */ `
      TRUNCATE TABLE 
        brands, 
        suppliers, 
        categories, 
        products, 
        product_variations, 
        line_items, 
        stock_movements 
        RESTART IDENTITY CASCADE;
    `);
    console.log("Table preparation complete.");

    for (const tableName in TABLES) {
      const sqlQuery = TABLES[tableName];
      await client.query(sqlQuery);
      console.log(`Verified table: ${tableName}`);
    }

    await client.query("COMMIT;");
    console.log("Table seeding complete.");
  } catch (error) {
    console.error("Failed to seed tables:", error);
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
