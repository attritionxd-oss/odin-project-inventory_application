import { pool } from "#models/pool.js";
import format from "pg-format";
import { buildUpdateQuery } from "#utils/buildUpdateQuery.js";

const supplierService = {
  create: async ({ supplier_name, contact_email }) => {
    const SQL = format(
      /* sql */ `
      INSERT INTO suppliers (supplier_name, contact_email)
      VALUES (%L, %L)
      RETURNING *;
    `,
      supplier_name,
      contact_email,
    );

    const { rows } = await pool.query(SQL);
    return rows[0];
  },

  getAll: async ({
    includeDeleted = false,
    orderByField = "supplier_name",
    isOrderAscBool = true,
  } = {}) => {
    const isOrderAsc = isOrderAscBool ? "ASC" : "DESC";

    const SQL = format(
      includeDeleted
        ? /* sql */ `
        SELECT * 
        FROM suppliers 
        ORDER BY %s %s;
        `
        : /* sql */ `
        SELECT * 
        FROM suppliers 
        WHERE deleted_at IS NULL 
        ORDER BY %s %s;
        `,

      orderByField,
      isOrderAsc,
    );
    const { rows: suppliers } = await pool.query(SQL);
    return suppliers;
  },

  getById: async (id) => {
    const SQL = format(
      /* sql */ `
        SELECT *
        FROM suppliers
        WHERE id = %L;
      `,
      id,
    );
    const { rows: supplier } = await pool.query(SQL);
    return supplier[0] || null;
  },

  update: async (id, { supplier_name, contact_email }) => {
    if (!id || id === "") throw new Error("`id` must be specified");

    const updates = { supplier_name, contact_email };

    const query = buildUpdateQuery("suppliers", updates, "id", id);

    const { rows } = await pool.query(query);
    return rows[0] || null;
  },

  softDelete: async (id) => {
    if (!id || id === "") throw new Error("`id` must be specified");
    const SQL = format(
      /* sql */ `
      UPDATE suppliers SET deleted_at = NOW()
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
      UPDATE suppliers SET deleted_at = NULL
      WHERE id = %L
      RETURNING *;
    `,
      id,
    );
    const result = await pool.query(SQL);
    return result;
  },
};

export default supplierService;
