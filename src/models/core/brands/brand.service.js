import { pool } from "#models/pool.js";
import format from "pg-format";
import { buildUpdateQuery } from "#utils/buildUpdateQuery.js";

const brandService = {
  create: async ({ brand_name }) => {
    const SQL = format(
      /* sql */ `
      INSERT INTO brands (brand_name)
      VALUES (%L)
      RETURNING *;
    `,
      brand_name,
    );

    const { rows } = await pool.query(SQL);
    return rows[0];
  },

  getAll: async ({
    includeDeleted = false,
    orderByField = "brand_name",
    isOrderAscBool = true,
  } = {}) => {
    const isOrderAsc = isOrderAscBool ? "ASC" : "DESC";

    const SQL = format(
      includeDeleted
        ? /* sql */ `
        SELECT * 
        FROM brands
        ORDER BY %s %s;
      `
        : /* sql */ `
        SELECT * 
        FROM brands
        WHERE deleted_at IS NULL
        ORDER BY %s %s;
      `,
      orderByField,
      isOrderAsc,
    );
    const { rows: brands } = await pool.query(SQL);
    return brands;
  },

  getById: async (id) => {
    const SQL = format(
      /* sql */ `
        SELECT *
        FROM brands
        WHERE id = %L;
      `,
      id,
    );
    const { rows: brand } = await pool.query(SQL);
    return brand[0] || null;
  },

  update: async (id, { brand_name }) => {
    if (!id || id === "") throw new Error("`id` must be specified");

    const updates = { brand_name };

    const query = buildUpdateQuery("brands", updates, "id", id);

    const { rows } = await pool.query(query);
    return rows[0] || null;
  },

  softDelete: async (id) => {
    if (!id || id === "") throw new Error("`id` must be specified");

    const SQL = format(
      /* sql */ `
      UPDATE brands SET deleted_at = NOW()
      WHERE id = %L
      RETURNING *;
    `,
      id,
    );
    const result = await pool.query(SQL);
    return result;
  },

  restore: async (id) => {
    if (!id || id === "") throw new Error("`id` must be specified");
    const SQL = format(
      /* sql */ `
      UPDATE brands SET deleted_at = NULL
      WHERE id = %L
      RETURNING *;
    `,
      id,
    );
    const result = await pool.query(SQL);
    return result;
  },
};

export default brandService;
