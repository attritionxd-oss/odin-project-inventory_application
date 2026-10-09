import { pool } from "#models/pool.js";
import format from "pg-format";
import { buildUpdateQuery } from "#utils/buildUpdateQuery.js";

const productVariationService = {
  create: async ({ product_id, sku, attributes }) => {
    const SQL = format(
      /* sql */ `
      INSERT INTO product_variations (product_id, sku, attributes)
      VALUES (%L, %L, %L)
      RETURNING *;
    `,
      product_id,
      sku,
      attributes,
    );

    const { rows } = await pool.query(SQL);
    return rows[0];
  },

  getByProductId: async (product_id) => {
    const query = /* sql */ `
      SELECT pv.*, li.stock_quantity, li.cost_price, li.store_price
      FROM product_variations pv
      LEFT JOIN line_items li ON li.variation_id = pv.id
      WHERE pv.product_id = $1
      ORDER BY pv.created_at ASC;
    `;

    const { rows } = await pool.query(query, [product_id]);
    return rows;
  },

  getById: async (id) => {
    const SQL = /* sql */ `
      SELECT pv.*, p.product_name
      FROM product_variations pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.id = $1
    `;
    const { rows: prodVar } = await pool.query(SQL, [id]);
    return prodVar[0] || null;
  },

  update: async (id, { product_id, sku, attributes }) => {
    if (!id) throw new Error("`id` must be specified");

    const updates = {
      product_id,
      sku,
      attributes,
    };

    const query = buildUpdateQuery("product_variations", updates, "id", id);

    const { rows } = await pool.query(query);
    return rows[0] || null;
  },

  delete: async (id) => {
    if (!id) throw new Error("`id` must be specified");

    const SQL = format(
      /* sql */ `
      DELETE from product_variations
      WHERE id = %L;
    `,
      id,
    );
    const result = await pool.query(SQL);
    return result;
  },
};

export default productVariationService;
