import { pool } from "#models/pool.js";
import supplierService from "./supplier.service.js";

describe("Supplier Service Integration", () => {
  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE suppliers RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("create()", () => {
    it("should insert and retrieve a supplier by ID", async () => {
      const inserted = await supplierService.create({
        supplier_name: "Logistics Inc",
        contact_email: "info@logistics.com",
      });

      expect(inserted).toHaveProperty("id");
      expect(inserted.supplier_name).toBe("Logistics Inc");

      const fetched = await supplierService.getById(inserted.id);

      expect(fetched.contact_email).toBe("info@logistics.com");
    });
  });

  describe("getAll()", () => {
    it("returns data from a seeded table", async () => {
      await supplierService.create({
        supplier_name: "Logistics Inc",
        contact_email: "info@logistics.com",
      });
      await supplierService.create({
        supplier_name: "Delivery Corp",
        contact_email: "info@delivery.com",
      });

      const data = await supplierService.getAll();

      expect(data).toMatchObject([
        {
          supplier_name: "Delivery Corp",
          contact_email: "info@delivery.com",
        },
        {
          supplier_name: "Logistics Inc",
          contact_email: "info@logistics.com",
        },
      ]);
    });

    it("returns an empty array when suppliers table is empty", async () => {
      const emptyArray = await supplierService.getAll();
      expect(emptyArray).toHaveLength(0);
      expect(emptyArray).toMatchObject([]);
    });
  });

  describe("getById()", () => {
    it("returns data when table is seeded", async () => {
      await supplierService.create({
        supplier_name: "Logistics Inc",
        contact_email: "info@logistics.com",
      });
      await supplierService.create({
        supplier_name: "Delivery Corp",
        contact_email: "info@delivery.com",
      });

      expect(await supplierService.getById(1)).toMatchObject({
        supplier_name: "Logistics Inc",
        contact_email: "info@logistics.com",
      });

      expect(await supplierService.getById("2")).toMatchObject({
        supplier_name: "Delivery Corp",
        contact_email: "info@delivery.com",
      });
    });

    it("returns null when specified ID is not found", async () => {
      const data = await supplierService.getById(1);
      expect(data).toBeNull();
    });
  });

  describe("update()", () => {
    it("should update only the specified ID", async () => {
      await supplierService.create({
        supplier_name: "Logistics Inc",
        contact_email: "info@logistics.com",
      });
      await supplierService.create({
        supplier_name: "Delivery Corp",
        contact_email: "info@delivery.com",
      });

      const updates = {
        supplier_name: "Global Logistics Inc",
        contact_email: "info@globallogistics.com",
      };

      const result = await supplierService.update(1, updates);
      expect(result).toMatchObject({
        supplier_name: "Global Logistics Inc",
        contact_email: "info@globallogistics.com",
      });

      expect(await supplierService.getById(1)).toMatchObject({
        supplier_name: "Global Logistics Inc",
        contact_email: "info@globallogistics.com",
      });

      expect(await supplierService.getById("2")).toMatchObject({
        supplier_name: "Delivery Corp",
        contact_email: "info@delivery.com",
      });
    });

    it("should throw an error if no ID is passed", async () => {
      await expect(
        supplierService.update(null, {
          supplier_name: "sup name",
        }),
      ).rejects.toThrow("`id` must be specified");
    });

    it("should return null if ID is not found", async () => {
      expect(
        await supplierService.update(99, {
          supplier_name: "sup name",
        }),
      ).toBeNull();
    });
  });

  describe("softDelete()", () => {
    it("should flag record as deleted by setting deleted_at with a timestamp", async () => {
      await supplierService.create({
        supplier_name: "Logistics Inc",
        contact_email: "info@logistics.com",
      });
      await supplierService.create({
        supplier_name: "Delivery Corp",
        contact_email: "info@delivery.com",
      });

      const deletionResult = await supplierService.softDelete(2);

      expect(
        await supplierService.getAll({ includeDeleted: true }),
      ).toMatchObject([
        {
          supplier_name: "Delivery Corp",
          contact_email: "info@delivery.com",
          deleted_at: deletionResult.rows[0].deleted_at,
        },
        {
          supplier_name: "Logistics Inc",
          contact_email: "info@logistics.com",
          deleted_at: null,
        },
      ]);

      const result = await supplierService.softDelete(1);
      expect(result.rowCount).toBe(1);
    });

    it("should return rowCount === 0 when given ID is not found", async () => {
      await supplierService.create({
        supplier_name: "Logistics Inc",
        contact_email: "info@logistics.com",
      });

      const data = await supplierService.softDelete(99);

      expect(data.rowCount).toBe(0);
    });

    it("should throw an error if no ID is passed", async () => {
      await expect(supplierService.softDelete(null)).rejects.toThrow(
        "`id` must be specified",
      );
    });
  });

  describe("restore()", () => {
    it("should remove deleted flag by setting deleted_at to null", async () => {
      const inserted = await supplierService.create({
        supplier_name: "Logistics Inc",
        contact_email: "info@logistics.com",
      });
      await supplierService.softDelete(inserted.id);

      await supplierService.restore(inserted.id);

      expect(await supplierService.getAll()).toMatchObject([
        {
          id: inserted.id,
          deleted_at: null,
        },
      ]);
    });

    it("should return rowCount === 0 when given ID is not found", async () => {
      const emptyData = await supplierService.restore(99);
      expect(emptyData.rowCount).toBe(0);
    });

    it("should throw an error if no ID is passed", async () => {
      await expect(supplierService.restore(null)).rejects.toThrow(
        "`id` must be specified",
      );
    });
  });
});
