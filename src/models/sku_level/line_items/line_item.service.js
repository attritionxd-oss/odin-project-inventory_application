import { pool } from "#models/pool.js";
import format from "pg-format";
import { buildUpdateQuery } from "#utils/buildUpdateQuery.js";

const lineItemService = {
  create: async ({
    variation_id,
    stock_quantity = 0,
    is_online_only = false,
    is_instore_only = false,
    cost_price = 0,
    suggested_retail_price = 0,
    store_price = 0,
  }) => {
    const SQL = /* sql */ `
      INSERT INTO line_items (
        variation_id, 
        stock_quantity, 
        is_online_only, 
        is_instore_only, 
        cost_price, 
        suggested_retail_price, 
        store_price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const { rows } = await pool.query(SQL, [
      variation_id,
      stock_quantity,
      is_online_only,
      is_instore_only,
      cost_price,
      suggested_retail_price,
      store_price,
    ]);
    return rows[0];
  },

  getAll: async () => {
    const SQL = /* sql */ `
      SELECT * FROM line_items;
    `;
    const { rows: line_items } = await pool.query(SQL);
    return line_items;
  },

  getById: async (id) => {
    const SQL = format(
      /* sql */ `
      SELECT * FROM line_items
      WHERE id = %L;
    `,
      id,
    );
    const { rows: line_items } = await pool.query(SQL);
    return line_items[0] || null;
  },

  update: async (
    id,
    {
      variation_id,
      stock_quantity,
      is_online_only,
      is_instore_only,
      cost_price,
      suggested_retail_price,
      store_price,
    },
  ) => {
    if (!id || id === "") throw new Error("`id` must be specified");

    const updates = {
      variation_id,
      stock_quantity,
      is_online_only,
      is_instore_only,
      cost_price,
      suggested_retail_price,
      store_price,
    };

    const query = buildUpdateQuery("line_items", updates, "id", id);

    const { rows } = await pool.query(query);
    return rows[0] || null;
  },
};

export default lineItemService;
