#! /user/bin/env mode

import dbSeedUtil from "#models/db-seed-util.js";
import SCHEMA_TABLES from "#models/schema.seed.js";

const SQL = /* sql */ `
    ${SCHEMA_TABLES.suppliers}

    INSERT INTO line_items (
      variation_id, 
      stock_quantity, 
      is_online_only, 
      is_instore_only, 
      cost_price, 
      suggested_retail_price, 
      store_price
    )
    VALUES (1, 10, false, false, 4.99, 5.99, 9.99);
`;

dbSeedUtil(SQL);

// note: bash seed command
// node --env-file=.env src/models/sku_level/line_items/line_item.seed.js
