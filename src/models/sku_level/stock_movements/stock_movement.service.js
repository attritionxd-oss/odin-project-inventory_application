import { pool } from "#models/pool.js";
import { buildUpdateQuery } from "#utils/buildUpdateQuery.js";

const stockMovementService = {
  /**
   * Adjusts stock level and records an audit movement log transactionally
   * e.g., if logging movement or updating the stock quantity fails, the
   * transaction rolls back completely.
   * @param {Object} params
   * @param {number} params.line_item_id
   * @param {number} params.quantity_change - Positive for additions, negative for deductions
   * @param {string} params.reason - 'PURCHASE_ORDER' | 'DAMAGED' | 'INVENTORY_COUNT' | 'SALE'
   * @param {string} params.reference_id - Optional order number or ticket ID
   */
  recordMovement: async ({
    line_item_id,
    quantity_change,
    reason,
    reference_id = null,
  }) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const insertMovementQuery = /* sql */ `
        INSERT INTO 
          stock_movements (line_item_id, quantity_change, reason, reference_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

      const movementRes = await client.query(insertMovementQuery, [
        line_item_id,
        quantity_change,
        reason,
        reference_id,
      ]);

      const updateStockQuery = /* sql */ `
        UPDATE line_items
        SET
          stock_quantity = stock_quantity + $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;

      const stockRes = await client.query(updateStockQuery, [
        quantity_change,
        line_item_id,
      ]);

      if (stockRes.rowCount === 0) {
        throw new Error(`Line item with ID ${line_item_id} does not exist.`);
      }

      await client.query("COMMIT");

      return {
        movement: movementRes.rows[0],
        updatedLineItem: stockRes.rows[0],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  getByLineItemId: async (line_item_id) => {
    const query = /* sql */ `
      SELECT * FROM stock_movements
      WHERE line_item_id = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [line_item_id]);
    return rows;
  },

  getRecentMovements: async (limit = 50) => {
    const query = /* sql */ `
      SELECT
        sm.*,
        pv.sku,
        p.product_name
      FROM stock_movements sm
      JOIN line_items li ON sm.line_item_id = li.id
      JOIN product_variations pv ON li.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      ORDER BY sm.created_at DESC
      LIMIT $1
    `;
    const { rows } = await pool.query(query, [limit]);
    return rows;
  },

  updateStockMovement: async (
    id,
    { line_item_id, quantity_change, reason, reference_id },
  ) => {
    if (!id || id === "") throw new Error("`id` must be specified");

    const updates = { line_item_id, quantity_change, reason, reference_id };

    const query = buildUpdateQuery("stock_movements", updates, "id", id);

    const { rows } = await pool.query(query);
    return rows[0] || null;
  },
};

export default stockMovementService;
