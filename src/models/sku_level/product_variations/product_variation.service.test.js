import { pool } from "#models/pool.js";
import productVariationService from "./product_variation.service.js";

describe("Product Variation Queries Integration", () => {
  beforeEach(async () => {
    await pool.query(/* sql */ `
      TRUNCATE TABLE product_variations, products, categories, brands, suppliers RESTART IDENTITY CASCADE;
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
      /* sql */ `
      INSERT INTO products (product_name, product_description, brand_id, supplier_id, category_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `,
      ["Mobile phone", "Mobile phone description", 1, 1, 1],
    );

    return {
      brand_id: brandRes.rows[0].id,
      supplier_id: supplierRes.rows[0].id,
      category_id: categoryRes.rows[0].id,
      product_id: productRes.rows[0].id,
    };
  }

  describe("create()", () => {
    it("should throw when passed a non-JSON value for `attribute`", async () => {
      const seeds = await createSeedData();

      const payload = {
        ...seeds,
        product_id: 1,
        sku: "SKU-ABC",
        attributes: '{"name": value}',
      };

      try {
        await productVariationService.create(payload);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toMatch(/invalid input syntax for type json/i);
      }
    });

    it("should successfully insert a record", async () => {
      const seeds = await createSeedData();

      const payload = {
        ...seeds,
        product_id: 1,
        sku: "SKU-TEST",
        attributes: '{"color": "Black", "storage": "128GB"}',
      };

      const prodVar = await productVariationService.create(payload);
      expect(prodVar).toMatchObject({
        id: 1,
        product_id: 1,
      });

      const result = await productVariationService.getByProductId(
        payload.product_id,
      );
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0].attributes).toMatchObject({
        color: "Black",
        storage: "128GB",
      });
      expect(result[0].product_id).toBe(1);
    });
  });

  describe("getByProductId()", () => {
    it("should return an empty array when product_variations table is empty", async () => {
      const emptyArray = await productVariationService.getByProductId(1);
      expect(emptyArray.length).toBe(0);
      expect(emptyArray).toMatchObject([]);
    });

    it("should return a data array from product_variations", async () => {
      const seeds = await createSeedData();

      const payload = {
        ...seeds,
        product_id: 1,
        sku: "SKU-TEST",
        attributes: '{"color": "Black", "storage": "128GB"}',
      };

      await productVariationService.create(payload);

      const data = await productVariationService.getByProductId(
        payload.product_id,
      );
      expect(Array.isArray(data)).toBeTruthy();
      expect(data[0]).toMatchObject({
        product_id: 1,
        sku: "SKU-TEST",
        attributes: {
          color: "Black",
          storage: "128GB",
        },
      });
    });
  });

  describe("getById()", () => {
    it("should return a product variation", async () => {
      const seeds = await createSeedData();

      const payload = {
        ...seeds,
        product_id: 1,
        sku: "SKU-TEST",
        attributes: '{"color": "Black", "storage": "128GB"}',
      };

      await productVariationService.create(payload);

      const prodVar = await productVariationService.getById(1);
      expect(prodVar).toMatchObject({
        product_id: 1,
        attributes: {
          color: "Black",
          storage: "128GB",
        },
      });
    });

    it("should return null for a non-existed ID", async () => {
      expect(await productVariationService.getById(1)).toBeNull();
    });
  });

  describe("update()", () => {
    it("should throw an error when ID is not passed", async () => {
      const seeds = await createSeedData();

      const payload = {
        ...seeds,
        product_id: 1,
        sku: "SKU-TEST",
        attributes: '{"color": "Black", "storage": "128GB"}',
      };
      try {
        await productVariationService.update(undefined, payload);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("`id` must be specified");
      }
    });

    it("should update only the specified id", async () => {
      const seeds = await createSeedData();

      await productVariationService.create({
        product_id: seeds.product_id,
        sku: "SKU-TEST-1",
        attributes: '{"color": "Black", "storage": "128 GB"}',
      });
      await productVariationService.create({
        product_id: seeds.product_id,
        sku: "SKU-TEST-2",
        attributes: '{"color": "Black", "storage": "256 GB"}',
      });
      await productVariationService.update(2, {
        attributes: '{"color": "Silver", "storage": "256 GB"}',
      });

      const prodVars = await productVariationService.getByProductId(
        seeds.product_id,
      );
      expect(prodVars).toMatchObject([
        {
          id: 1,
          sku: "SKU-TEST-1",
          attributes: { color: "Black", storage: "128 GB" },
        },
        {
          id: 2,
          sku: "SKU-TEST-2",
          attributes: { color: "Silver", storage: "256 GB" },
        },
      ]);
    });

    it("should return null when ID is not found", async () => {
      const emptyData = await productVariationService.update(1, {
        product_id: 1,
        sku: "SKU-TEST",
        attributes: '{"attributeKey": "attributeValue"}',
      });
      expect(emptyData).toBeNull();
    });

    it("should throw an error if no update payload is specified", async () => {
      try {
        await productVariationService.update(1, {});
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("No valid fields to update");
      }
    });
  });

  describe("delete()", () => {
    it("should throw an error when ID is not specified", async () => {
      try {
        await productVariationService.delete();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("`id` must be specified");
      }
    });

    it("should delete only the specified record", async () => {
      const seeds = await createSeedData();
      await productVariationService.create({
        ...seeds,
        product_id: 1,
        sku: "SKU-TEST-1",
        attributes: '{"color": "Black", "storage": "128 GB"}',
      });
      await productVariationService.create({
        ...seeds,
        product_id: 1,
        sku: "SKU-DELETE-2",
        attributes: '{"color": "Black", "storage": "256 GB"}',
      });

      await productVariationService.delete(2);

      const allProdVars = await productVariationService.getByProductId(
        seeds.product_id,
      );

      expect(allProdVars).toHaveLength(1);
      expect(allProdVars).toMatchObject([
        {
          product_id: 1,
          sku: "SKU-TEST-1",
          attributes: { color: "Black", storage: "128 GB" },
        },
      ]);
    });

    it("should return rowCount === 0 when specified ID is not found", async () => {
      const deletetionResult = await productVariationService.delete(99);
      expect(deletetionResult.rowCount).toBe(0);
    });
  });
});
