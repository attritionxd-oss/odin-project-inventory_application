#! /user/bin/env mode

import dbSeedUtil from "#models/db-seed-util.js";
import SCHEMA_TABLES from "#models/schema.seed.js";

const SQL = /* sql */ `
    ${SCHEMA_TABLES.suppliers}

    INSERT INTO brands (brand_name)
    VALUES
      ('Remotely'), ('Imaginary'), ('Wazzap')
`;

dbSeedUtil(SQL);

// note: bash seed command
// node --env-file=.env src/models/core/brands/brand.seed.js
