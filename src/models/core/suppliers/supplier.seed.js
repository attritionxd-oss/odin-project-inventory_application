#! /user/bin/env mode

import dbSeedUtil from "#models/db-seed-util.js";
import SCHEMA_TABLES from "#models/schema.seed.js";

const SQL = /* sql */ `
    ${SCHEMA_TABLES.suppliers}

    INSERT INTO suppliers (supplier_name, contact_email)
    VALUES
      ('Logistics Inc', 'info@logistics.com'),
      ('Teleported Warez', 'sales@teleportedwares.com');
`;

dbSeedUtil(SQL);

// note: bash seed command
// node --env-file=.env src/models/core/suppliers/supplier.seed.js
