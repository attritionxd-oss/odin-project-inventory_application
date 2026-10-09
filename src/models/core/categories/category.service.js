import { pool } from "#models/pool.js";
import format from "pg-format";
import { buildUpdateQuery } from "#utils/buildUpdateQuery.js";

const categoryService = {
  create: async ({ category_name, parent_id = null }) => {
    const SQL = format(
      /* sql */ `
      INSERT INTO categories (category_name, parent_id)
      VALUES (%L, %L)
      RETURNING *;
    `,
      category_name,
      parent_id,
    );

    const { rows } = await pool.query(SQL);
    return rows[0];
  },

  getAll: async () => {
    const SQL = /* sql */ `
      SELECT 
        c.*, 
        p.category_name AS parent_name
      FROM categories c
      LEFT JOIN categories p 
        ON c.parent_id = p.id
      ORDER BY c.category_name ASC;
    `;
    const { rows: categories } = await pool.query(SQL);
    return categories;
  },

  getById: async (id) => {
    const SQL = format(
      /* sql */ `
        SELECT *
        FROM categories
        WHERE id = %L;
      `,
      id,
    );
    const { rows: category } = await pool.query(SQL);
    return category[0] || null;
  },

  update: async (id, { category_name, parent_id = null }) => {
    const updates = { category_name, parent_id };

    const query = buildUpdateQuery("categories", updates, "id", id);

    const { rows } = await pool.query(query);
    return rows[0] || null;
  },

  delete: async (id) => {
    const SQL = format(
      /* sql */ `
      DELETE from categories
      WHERE id = %L;
    `,
      id,
    );
    const result = await pool.query(SQL);
    return result;
  },
};

export default categoryService;
