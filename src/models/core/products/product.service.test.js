import { pool } from "#models/pool.js";
import productService from "./product.service.js";

describe("Product Service Integration", () => {
  beforeEach(async () => {
    await pool.query(/* sql */ `
      TRUNCATE TABLE products, categories, brands, suppliers RESTART IDENTITY CASCADE;
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

    return {
      brand_id: brandRes.rows[0].id,
      supplier_id: supplierRes.rows[0].id,
      category_id: categoryRes.rows[0].id,
    };
  }

  describe("create()", () => {
    it("should create a record using default references", async () => {
      await productService.create({ product_name: "Mechanical Keyboard" });

      const allProducts = await productService.getAll();

      expect(allProducts).toMatchObject([
        {
          brand_id: null,
          category_id: null,
          supplier_id: null,
          product_name: "Mechanical Keyboard",
        },
      ]);
    });

    it("should create a record with specified foreign keys to referenced tables", async () => {
      const seeds = await createSeedData();

      const payload = {
        ...seeds,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      };

      const newProduct = await productService.create(payload);
      expect(newProduct.rowCount).toBe(1);
      expect(newProduct.rows).toMatchObject([
        {
          brand_id: seeds.brand_id,
          category_id: seeds.category_id,
          supplier_id: seeds.supplier_id,
          product_name: "Mechanical Keyboard",
          product_description: "RGB Mechanical Keyboard",
        },
      ]);

      const product = await productService.getById(1);
      expect(product.product_name).toBe("Mechanical Keyboard");
    });

    it("should create a record even with incomplete foreign keys", async () => {
      const seeds = await createSeedData();

      const payload = {
        ...seeds,
        supplier_id: null,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      };

      const newProduct = await productService.create(payload);
      expect(newProduct.rows).toMatchObject([
        {
          brand_id: seeds.brand_id,
          category_id: seeds.category_id,
          supplier_id: null,
          product_name: "Mechanical Keyboard",
          product_description: "RGB Mechanical Keyboard",
        },
      ]);
    });

    it("getProductById should return null when products table is empty", async () => {
      const empty = await productService.getById(1);
      expect(empty).toBeNull();
    });
  });

  describe("getAll()", () => {
    it("should return data from a seeded table", async () => {
      const seeds = await createSeedData();

      const payload = {
        ...seeds,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      };

      await productService.create(payload);

      const products = await productService.getAll(seeds);
      expect(products).toMatchObject([
        {
          ...seeds,
          product_name: "Mechanical Keyboard",
          product_description: "RGB Mechanical Keyboard",
        },
      ]);
    });

    it("should return an empty array when products table is empty", async () => {
      const emptyArray = await productService.getAll();
      expect(emptyArray.length).toBe(0);
      expect(emptyArray).toMatchObject([]);
    });
  });

  describe("update()", () => {
    it("should update only the specified ID", async () => {
      const seeds = await createSeedData();

      await productService.create({
        ...seeds,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      });
      await productService.create({
        ...seeds,
        product_name: "Gaming Mouse",
        product_description: "Wireless gaming mouse",
      });

      const updateResult = await productService.update(2, {
        product_description: "Wired gaming mouse",
      });

      expect(updateResult.product_description).toBe("Wired gaming mouse");

      expect(await productService.getAll()).toMatchObject([
        {
          product_name: "Gaming Mouse",
          product_description: "Wired gaming mouse",
        },
        {
          product_name: "Mechanical Keyboard",
          product_description: "RGB Mechanical Keyboard",
        },
      ]);
    });

    it("should update when only product_name is given", async () => {
      const seeds = await createSeedData();

      await productService.create({
        ...seeds,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      });

      await productService.update(1, {
        product_name: "Gaming Mechanical Keyboard",
      });

      expect(await productService.getAll()).toMatchObject([
        {
          ...seeds,
          product_name: "Gaming Mechanical Keyboard",
          product_description: "RGB Mechanical Keyboard",
        },
      ]);
    });

    it("should update when only product_description is given", async () => {
      const seeds = await createSeedData();

      await productService.create({
        ...seeds,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      });

      await productService.update(1, {
        product_description: "RGB Gaming Mechanical Keyboard",
      });

      expect(await productService.getAll()).toMatchObject([
        {
          ...seeds,
          product_name: "Mechanical Keyboard",
          product_description: "RGB Gaming Mechanical Keyboard",
        },
      ]);
    });

    it("should update when only references is being updated", async () => {
      const seeds = await createSeedData();
      const seeds2 = await createSeedData();

      await productService.create({
        ...seeds,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      });

      await productService.update(1, {
        brand_id: 2,
        category_id: 2,
        supplier_id: 2,
      });

      expect(await productService.getAll()).toMatchObject([
        {
          ...seeds2,
          product_name: "Mechanical Keyboard",
          product_description: "RGB Mechanical Keyboard",
        },
      ]);
    });

    it("returns null when specified ID is not found", async () => {
      const emptyData = await productService.update(1, {
        product_name: "Non-existent product",
      });
      expect(emptyData).toBeNull();
    });
  });

  describe("softDelete()", () => {
    it("should indicate deleted only for the specified record", async () => {
      const seeds = await createSeedData();

      await productService.create({
        ...seeds,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      });

      const deletionResult = await productService.softDelete(1);

      expect(deletionResult.rowCount).toBe(1);
      expect(
        await productService.getAll({ ...seeds, includeDeleted: true }),
      ).toMatchObject([
        {
          product_name: "Mechanical Keyboard",
          product_description: "RGB Mechanical Keyboard",
          deleted_at: deletionResult.rows[0].deleted_at,
        },
      ]);
    });

    it("should return rowCount === 0 when specified ID is not found", async () => {
      const seeds = await createSeedData();

      await productService.create({
        ...seeds,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      });

      const deletionResult = await productService.softDelete(99);

      expect(deletionResult.rowCount).toBe(0);
    });
  });

  describe("restore", () => {
    it("should remove deleted indicator", async () => {
      const seeds = await createSeedData();

      await productService.create({
        ...seeds,
        product_name: "Mechanical Keyboard",
        product_description: "RGB Mechanical Keyboard",
      });

      await productService.softDelete(1);
      // expect(await productService.getById(1)).toEqual();
      let allProds = await productService.getAll({ includeDeleted: true });
      expect(allProds[0].deleted_at).not.toBeNull();

      await productService.restore(1);
      allProds = await productService.getAll({ includeDeleted: true });
      expect(allProds[0].deleted_at).toBeNull();
    });
  });
});
