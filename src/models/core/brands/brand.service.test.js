import { pool } from "#models/pool.js";
import brandService from "./brand.service.js";

describe("Brand Queries Integration", () => {
  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE brands RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("insertBrand, getBrandById", () => {
    it("should insert and retrieve a brand by ID", async () => {
      const inserted = await brandService.create({
        brand_name: "Local Brand",
      });

      expect(inserted).toHaveProperty("id");
      expect(inserted.brand_name).toBe("Local Brand");

      const fetched = await brandService.getById(inserted.id);

      expect(fetched.brand_name).toBe("Local Brand");
    });

    it("should return null when ID does not exist", async () => {
      const result = await brandService.getById(1);

      expect(result).toBeNull();
    });
  });

  describe("insertBrand, getAllBrands", () => {
    it("should insert and retrieve all brands", async () => {
      await brandService.create({
        brand_name: "Local Brand",
      });
      await brandService.create({
        brand_name: "International Brand",
      });

      const brands = await brandService.getAll();

      expect(brands).toMatchObject([
        {
          brand_name: "International Brand",
        },
        {
          brand_name: "Local Brand",
        },
      ]);

      const result = await brandService.update(2, {
        brand_name: "Global Brand",
      });

      expect(result).toMatchObject({
        brand_name: "Global Brand",
      });

      expect(await brandService.getById(1)).toMatchObject({
        brand_name: "Local Brand",
      });
    });

    it("should throw an error if no ID is passed", async () => {
      await expect(
        brandService.update(null, {
          brand_name: "non-existent brand",
        }),
      ).rejects.toThrow("`id` must be specified");
    });

    it("should return null if ID is not found", async () => {
      expect(
        await brandService.update(99, {
          brand_name: "non-existent brand",
        }),
      ).toBeNull();
    });
  });

  describe("deleteBrand", () => {
    it("should indicate deleted only for the specified record", async () => {
      await brandService.create({
        brand_name: "Local Brand",
      });
      await brandService.create({
        brand_name: "International Brand",
      });

      const deletionResult = await brandService.softDelete(1);
      expect(deletionResult.rowCount).toBe(1);

      expect(await brandService.getAll({ includeDeleted: true })).toMatchObject(
        [
          {
            brand_name: "International Brand",
            deleted_at: null,
          },
          {
            brand_name: "Local Brand",
            deleted_at: deletionResult.rows[0].deleted_at,
          },
        ],
      );
    });

    it("should return rowCount === 0 when given ID is not found", async () => {
      await brandService.create({
        brand_name: "Local Brand",
      });

      const data = await brandService.softDelete(99);
      expect(data.rowCount).toBe(0);
    });

    it("should throw error if no ID is passed", async () => {
      await expect(brandService.softDelete(null)).rejects.toThrow(
        "`id` must be specified",
      );
    });
  });
});
