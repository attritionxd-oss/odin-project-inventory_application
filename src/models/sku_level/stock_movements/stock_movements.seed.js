#! /user/bin/env mode

import dbSeedUtil from "#models/db-seed-util.js";
import SCHEMA_TABLES from "#models/schema.seed.js";

const SQL = /* sql */ `
    ${SCHEMA_TABLES.suppliers}

    INSERT INTO stock_movements (line_item_id, quantity_change, reason, reference_id)
      VALUES (1, 10, 'restock', 'ref-20261008-some_unique_postfix_id');
`;

dbSeedUtil(SQL);

// note: bash seed command
// node --env-file=.env src/models/sku_level/stock_movements/stock_movements.seed.js
