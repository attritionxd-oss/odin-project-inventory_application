#! /user/bin/env mode

import dbSeedUtil from "#models/db-seed-util.js";
import SCHEMA_TABLES from "#models/schema.seed.js";

const SQL = /* sql */ `
    ${SCHEMA_TABLES.suppliers}

    INSERT INTO categories (category_name)
    VALUES
      ('Electronics'), 
      ('Apparel');

    INSERT INTO categories (category_name, parent_id)
    VALUES 
      ('Mobile Phones', (SELECT id FROM categories WHERE category_name = 'Electronics')), 
      ('Mobile Accessories', (SELECT id FROM categories WHERE category_name = 'Electronics')), 
      ('Shirts', (SELECT id FROM categories WHERE category_name = 'Apparel'));

    INSERT INTO categories (category_name, parent_id)
    VALUES
      ('Smartphones', (SELECT id FROM categories WHERE category_name = 'Mobile Phones')),
      ('Phone chargers', (SELECT id FROM categories WHERE category_name = 'Mobile Accessories')),
      ('Men''s shirts', (SELECT id FROM categories WHERE category_name = 'Shirts')),
      ('Women''s tops', (SELECT id FROM categories WHERE category_name = 'Shirts'));
`;

dbSeedUtil(SQL);

// note: bash seed command
// node --env-file=.env src/models/core/categories/category.seed.js
