import { pool } from "#models/pool.js";
import format from "pg-format";
import stockMovementService from "./stock_movement.service.js";

describe("Stock Movement Queries Integration", () => {
  beforeEach(async () => {
    await pool.query(/* sql */ `
      TRUNCATE TABLE stock_movements, line_items, product_variations, products, categories, brands, suppliers RESTART IDENTITY CASCADE;
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  async function createSeedData() {
    const brandRes = await pool.query(/* sql */ `
      INSERT INTO brands (brand_name) values ('Acme') RETURNING id;
    `);

    const supplierRes = await pool.query(/* sql */ `
      INSERT INTO suppliers (supplier_name) VALUES ('Global Tech') RETURNING id;
    `);

    const categoryRes = await pool.query(/* sql */ `
      INSERT INTO categories (category_name) VALUES ('Electronics') RETURNING id;
    `);

    const productRes = await pool.query(
      format(
        /* sql */ `
      INSERT INTO products (brand_id, supplier_id, category_id, product_name, product_description)
      VALUES (%L, %L, %L, 'Mobile Phone', 'Some description')
      RETURNING id;
    `,
        brandRes.rows[0].id,
        supplierRes.rows[0].id,
        categoryRes.rows[0].id,
      ),
    );

    const prodVarRes = await pool.query(
      format(
        /* sql */ `
        INSERT INTO product_variations (product_id, sku, attributes)
        VALUES (%L, 'SKU-TEST', '{"color":"Black","storage":"128GB"}')
        RETURNING id;
    `,
        productRes.rows[0].id,
      ),
    );

    const lineItemRes = await pool.query(
      format(
        /* sql */ `
      INSERT INTO line_items (
        variation_id, 
        stock_quantity, 
        is_online_only, 
        is_instore_only, 
        cost_price, 
        suggested_retail_price, 
        store_price
      )
      VALUES (%L, 10, false, false, 4.99, 5.99, 9.99)
      RETURNING id;
    `,
        prodVarRes.rows[0].id,
      ),
    );

    return {
      brand_id: brandRes.rows[0].id,
      supplier_id: supplierRes.rows[0].id,
      category_id: categoryRes.rows[0].id,
      product_id: productRes.rows[0].id,
      variation_id: prodVarRes.rows[0].id,
      line_item_id: lineItemRes.rows[0].id,
    };
  }

  const getSamplePayload = (line_item_id) => ({
    line_item_id: line_item_id,
    quantity_change: 10,
    reason: "restock",
    reference_id: "ref-20261008-some_unique_postfix_id",
  });

  describe("createSeedData(): test seed data", () => {
    it("should successfully be created", async () => {
      const seeds = await createSeedData();

      const { rows: lineItemRes } = await pool.query(
        "SELECT * FROM line_items;",
      );
      expect(lineItemRes).toMatchObject([
        { id: seeds.line_item_id, variation_id: seeds.variation_id },
      ]);

      const { rows: prodVarRes } = await pool.query(
        "SELECT * FROM product_variations;",
      );
      expect(prodVarRes).toMatchObject([
        { id: seeds.variation_id, product_id: seeds.product_id },
      ]);

      const { rows: productRes } = await pool.query("SELECT * FROM products;");
      expect(productRes).toMatchObject([
        {
          id: seeds.product_id,
          brand_id: seeds.brand_id,
          category_id: seeds.category_id,
          supplier_id: seeds.supplier_id,
        },
      ]);
    });
  });

  describe("recordMovement()", () => {
    it("should insert a record successfully", async () => {
      const seeds = await createSeedData();
      const payload = getSamplePayload(seeds.line_item_id);

      const newStockMovement =
        await stockMovementService.recordMovement(payload);

      const allStockMovements = await stockMovementService.getByLineItemId(
        seeds.line_item_id,
      );

      expect(allStockMovements).toHaveLength(1);
      expect(allStockMovements).toMatchObject([
        {
          id: newStockMovement.movement.id,
          line_item_id: seeds.line_item_id,
          quantity_change: 10,
          reason: "restock",
        },
      ]);
    });

    it("should throw an error when line_item_id does not exist", async () => {
      await expect(
        stockMovementService.recordMovement(getSamplePayload(99)),
      ).rejects.toThrow(/stock_movements_line_item_id_fkey/i);
    });
  });

  describe("getByLineItemId()", () => {
    it("should return an empty array when stock_movement table is empty", async () => {
      const emptyArray = await stockMovementService.getByLineItemId(99);
      expect(emptyArray).toHaveLength(0);
      expect(emptyArray).toEqual([]);
    });

    it("should return all existing records by line_item_id", async () => {
      const seeds = await createSeedData();
      const payload = getSamplePayload(seeds.line_item_id);

      await stockMovementService.recordMovement(payload);
      await stockMovementService.recordMovement(payload);

      const allStockMovements = await stockMovementService.getByLineItemId(1);

      expect(allStockMovements).toHaveLength(2);
      expect(allStockMovements).toMatchObject([
        { id: 2, line_item_id: 1 },
        { id: 1, line_item_id: 1 },
      ]);
    });
  });

  describe("getRecentMovements()", () => {
    it("should return a stock movement record", async () => {
      const seeds = await createSeedData();
      const payload = getSamplePayload(seeds.line_item_id);

      const record1 = await stockMovementService.recordMovement(payload);
      const record2 = await stockMovementService.recordMovement(payload);
      expect(record1.movement).toMatchObject({
        id: 1,
        line_item_id: seeds.line_item_id,
        quantity_change: 10,
      });
      expect(record2.movement.quantity_change).toBe(10);

      expect(await stockMovementService.getRecentMovements()).toMatchObject([
        { id: 2, line_item_id: seeds.line_item_id, quantity_change: 10 },
        { id: 1, line_item_id: seeds.line_item_id, quantity_change: 10 },
      ]);
    });

    it("should also update the corresponding ID in the line_items table", async () => {
      const seeds = await createSeedData();
      const payload = getSamplePayload(seeds.line_item_id);

      const record1 = await stockMovementService.recordMovement(payload);
      const record2 = await stockMovementService.recordMovement(payload);

      const { rows: lineItemRes } = await pool.query(
        "SELECT * FROM line_items;",
      );
      expect(lineItemRes).toMatchObject([
        {
          id: seeds.line_item_id,
          stock_quantity:
            10 +
            record1.movement.quantity_change +
            record2.movement.quantity_change,
        },
      ]);
    });
  });

  describe("update()", () => {
    it("should update existing stock movement record properties", async () => {
      const seeds = await createSeedData();
      const payload = getSamplePayload(seeds.line_item_id);
      await stockMovementService.recordMovement(payload);
      const [insertedRecord] = await stockMovementService.getByLineItemId(
        seeds.line_item_id,
      );

      const updatedRecord = await stockMovementService.updateStockMovement(
        insertedRecord.id,
        {
          quantity_change: -20,
          reason: "sale",
        },
      );

      expect(updatedRecord).toMatchObject({
        id: insertedRecord.id,
        line_item_id: seeds.line_item_id,
        quantity_change: -20,
        reason: "sale",
      });
    });

    it("should throw an error if ID is not passed", async () => {
      await expect(
        stockMovementService.updateStockMovement(null, getSamplePayload(1)),
      ).rejects.toThrow("`id` must be specified");
    });

    it("should return null if ID is not found", async () => {
      expect(
        await stockMovementService.updateStockMovement(99, getSamplePayload(1)),
      ).toBeNull();
    });
  });
});
