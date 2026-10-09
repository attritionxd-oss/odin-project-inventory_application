#! /user/bin/env mode

import dbSeedUtil from "#models/db/db-seed-util.js";
import SCHEMA_TABLES from "#models/db/schema.seed.js";

const SQL = /* sql */ `
    ${SCHEMA_TABLES.suppliers}

    INSERT INTO product_variations (product_id, sku, attributes)
    VALUES
      (1, 'CELLP-A123-1', '{"color": "Black", "storage": "128 GB"}'),
      (1, 'CELLP-A123-2', '{"color": "Black", "storage": "256 GB"}'),
      (1, 'CELLP-A123-3', '{"color": "Silver", "storage": "128 GB"}'),
      (1, 'CELLP-A123-4', '{"color": "Silver", "storage": "256 GB"}');
`;

dbSeedUtil(SQL);

// note: bash seed command
// node --env-file=.env src/models/sku_level/product_variations/product_variations.seed.js
