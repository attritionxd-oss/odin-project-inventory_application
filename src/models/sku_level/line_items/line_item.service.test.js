import { pool } from "#models/pool.js";
import format from "pg-format";
import lineItemService from "./line_item.service.js";

describe("Line Item Queries Integration", () => {
  beforeEach(async () => {
    await pool.query(/* sql */ `
      TRUNCATE TABLE line_items, product_variations, products, categories, brands, suppliers RESTART IDENTITY CASCADE;
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

    return {
      brand_id: brandRes.rows[0].id,
      supplier_id: supplierRes.rows[0].id,
      category_id: categoryRes.rows[0].id,
      product_id: productRes.rows[0].id,
      variation_id: prodVarRes.rows[0].id,
    };
  }

  const getSamplePayload = (variation_id) => ({
    variation_id: variation_id,
    stock_quantity: 10,
    is_online_only: "false",
    is_instore_only: "false",
    cost_price: 4.99,
    suggested_retail_price: 5.99,
    store_price: 9.99,
  });

  describe("create()", () => {
    it("should insert a record successfully", async () => {
      const seeds = await createSeedData();

      const payload = getSamplePayload(seeds.variation_id);

      const lineItem = await lineItemService.create(payload);
      expect(lineItem).toMatchObject({
        id: 1,
        variation_id: seeds.variation_id,
      });

      const allLineItems = await lineItemService.getAll();
      expect(allLineItems).toHaveLength(1);
      expect(allLineItems).toMatchObject([
        {
          variation_id: 1,
          stock_quantity: 10,
          suggested_retail_price: "5.99",
          store_price: "9.99",
        },
      ]);
    });

    it("should insert a record when only variation ID is specified", async () => {
      const seeds = await createSeedData();

      const lineItem = await lineItemService.create({
        variation_id: seeds.variation_id,
      });

      expect(lineItem).toMatchObject({
        id: 1,
        variation_id: seeds.variation_id,
        stock_quantity: 0,
      });
    });

    it("should throw when variation ID is not specified", async () => {
      await expect(lineItemService.create()).rejects.toThrow(/variation_id/i);
    });

    it("should throw when variation ID does not exist", async () => {
      await expect(
        lineItemService.create({ variation_id: 99 }),
      ).rejects.toThrow(/line_items_variation_id_fkey/i);
    });
  });

  describe("getAll()", () => {
    it("should return an empty array when line_items table is empty", async () => {
      const emptyArray = await lineItemService.getAll();
      expect(emptyArray).toHaveLength(0);
      expect(emptyArray).toEqual([]);
    });

    it("should return all inserted line items", async () => {
      const seeds = await createSeedData();
      await lineItemService.create(getSamplePayload(seeds.variation_id));
      await lineItemService.create(getSamplePayload(seeds.variation_id));

      const allLineItems = await lineItemService.getAll();
      expect(allLineItems).toHaveLength(2);
      expect(allLineItems).toMatchObject([
        { id: 1, variation_id: 1, cost_price: "4.99" },
        { id: 2, variation_id: 1, cost_price: "4.99" },
      ]);
    });
  });

  describe("getById()", () => {
    it("should return a line item record when it exists", async () => {
      const seeds = await createSeedData();

      const payload = getSamplePayload(seeds.variation_id);

      const lineItem = await lineItemService.create(payload);
      expect(lineItem).toHaveProperty("id");
      expect(lineItem).toHaveProperty("variation_id");
      expect(lineItem).toHaveProperty("updated_at");

      expect(await lineItemService.getAll()).toMatchObject([
        {
          variation_id: seeds.variation_id,
          stock_quantity: 10,
        },
      ]);
    });

    it("should return null if ID is not found", async () => {
      expect(await lineItemService.getById(99)).toBeNull();
    });
  });

  describe("update", () => {
    it("should update existing line item properties", async () => {
      const seeds = await createSeedData();
      const payload = getSamplePayload(seeds.variation_id);
      await lineItemService.create(payload);
      const [insertedItem] = await lineItemService.getAll();

      const updatedLineItem = await lineItemService.update(insertedItem.id, {
        stock_quantity: 100,
        is_instore_only: true,
      });

      expect(updatedLineItem).toMatchObject({
        id: insertedItem.id,
        variation_id: seeds.variation_id,
        stock_quantity: 100,
        is_instore_only: true,
        is_online_only: false,
        cost_price: "4.99",
      });
    });

    it("should throw an error if no ID is passed", async () => {
      await expect(
        lineItemService.update(null, getSamplePayload(1)),
      ).rejects.toThrow("`id` must be specified");
    });

    it("should return null if ID is not found", async () => {
      expect(await lineItemService.update(99, getSamplePayload(1))).toBeNull();
    });
  });
});
