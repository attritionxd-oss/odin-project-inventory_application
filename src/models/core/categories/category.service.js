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

  getAll: async ({
    orderByField = "category_name",
    isOrderAscBool = true,
  } = {}) => {
    const orderBy = {
      id: "c.id",
      category_name: "c.category_name",
      parent_id: "c.parent_id",
      parent_name: "p.category_name",
    };
    const isOrderAsc = isOrderAscBool ? "ASC" : "DESC";

    const SQL = format(
      /* sql */ `
      SELECT 
        c.*, 
        p.category_name AS parent_name
      FROM categories c
      LEFT JOIN categories p 
        ON c.parent_id = p.id
      ORDER BY %s %s;
    `,
      orderBy[orderByField],
      isOrderAsc,
    );
    const { rows: categories } = await pool.query(SQL);
    return categories;
  },

  getCategoryAncestors: async (id) => {
    const query = /* sql */ `
      WITH RECURSIVE category_path AS (
        SELECT id, category_name, parent_id, 1 AS depth
        FROM categories
        WHERE id = $1

        UNION ALL
        SELECT c.id, c.category_name, c.parent_id, cp.depth + 1
        FROM categories c
        JOIN category_path cp ON c.id = cp.parent_id
      )
      SELECT 
        cp.*,
        p.category_name AS parent_name
      FROM category_path cp
      LEFT JOIN categories p
        ON cp.parent_id = p.id
      ORDER BY depth DESC;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows;
  },

  getAllCategoriesWithAncestors: async ({
    orderByField = "category_name",
    isOrderAscBool = true,
  } = {}) => {
    const orderBy = {
      id: "c.id",
      category_name: "c.category_name",
      parent_id: "c.parent_id",
      parent_name: "p.category_name",
    };
    const isOrderAsc = isOrderAscBool ? "ASC" : "DESC";

    const query = format(
      /* sql */ `
      WITH RECURSIVE category_tree AS (
        SELECT
          id AS target_id,
          id,
          category_name,
          parent_id,
          1 AS depth
        FROM categories

        UNION ALL

        SELECT
          ct.target_id,
          c.id,
          c.category_name,
          c.parent_id,
          ct.depth + 1
        FROM categories c
        JOIN category_tree ct ON c.id = ct.parent_id
      )
      SELECT
        c.id,
        c.category_name,
        c.parent_id,
        p.category_name AS parent_name,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ct.id,
            'category_name', ct.category_name,
            'parent_id', ct.parent_id
          ) ORDER BY ct.depth DESC
        ) AS ancestors
      FROM categories c
      JOIN category_tree ct 
        ON c.id = ct.target_id
      LEFT JOIN categories p 
        ON c.parent_id = p.id
      GROUP BY c.id, c.category_name, c.parent_id, p.category_name
      ORDER BY %s %s;
    `,
      orderBy[orderByField] || "c.category_name",
      isOrderAsc,
    );

    const { rows } = await pool.query(query);
    return rows;
  },

  getById: async (id) => {
    const SQL = format(
      /* sql */ `
        SELECT 
          c.*,
          p.category_name AS parent_name
        FROM categories c
        LEFT JOIN categories p
          ON c.parent_id = p.id
        WHERE c.id = %L;
      `,
      id,
    );
    const { rows: category } = await pool.query(SQL);
    return category[0] || null;
  },

  getDescendantIds: async (categoryId) => {
    const query = /* sql */ `
      WITH RECURSIVE descendants AS (
        SELECT id FROM categories WHERE parent_id = $1
        UNION ALL
        SELECT c.id FROM categories c
        JOIN descendants d ON c.parent_id = d.id
      )
      SELECT id FROM descendants;
    `;
    const { rows } = await pool.query(query, [categoryId]);
    return rows.map((r) => r.id);
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
