#! /user/bin/env mode

import dbSeedUtil from "#models/db-seed-util.js";
import SCHEMA_TABLES from "#models/schema.seed.js";

const SQL = /* sql */ `
    ${SCHEMA_TABLES.suppliers}

    INSERT INTO products (brand_id, supplier_id, category_id, product_name, product_description)
    VALUES
      (2, 2, 3, 'Imaginary Phone 14', 'The imaginary phone of the future, version 14!'), 
      (1, 1, 8, 'Remote Shirt', 'The first shirt that does not touch your skin, Remote Shirt!'),
      (1, 1, 9, 'Remote Top', 'The first top that does not touch your skin, Remote Top!');
`;

dbSeedUtil(SQL);

// note: bash seed command
// node --env-file=.env src/models/core/products/products.seed.js
