import { pool } from "#models/pool.js";
import categoryService from "./category.service.js";

describe("Category Service Integration", () => {
  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE categories RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("create()", () => {
    it("should insert a category", async () => {
      const inserted = await categoryService.create({
        category_name: "Test category",
      });

      expect(inserted).toHaveProperty("id");
      expect(inserted.category_name).toBe("Test category");

      const fetched = await categoryService.getById(inserted.id);

      expect(fetched.category_name).toBe("Test category");
    });
  });

  describe("getAll()", () => {
    it("should return data from a seeded table", async () => {
      await categoryService.create({
        category_name: "Test category 1",
      });
      await categoryService.create({
        category_name: "Test category 2",
      });

      const data = await categoryService.getAll();

      expect(data).toMatchObject([
        {
          category_name: "Test category 1",
        },
        {
          category_name: "Test category 2",
        },
      ]);
    });

    it("should return an empty array when categories table is empty", async () => {
      const emptyArray = await categoryService.getAll();
      expect(emptyArray).toHaveLength(0);
      expect(emptyArray).toMatchObject([]);
    });
  });

  describe("getCategoryAncestors()", () => {
    it("should return a category record's ancestors", async () => {
      const cat1a = await categoryService.create({
        category_name: "Test category 1",
      });
      const cat1b = await categoryService.create({
        category_name: "Test category 2",
        parent_id: cat1a.id,
      });
      const cat1c = await categoryService.create({
        category_name: "Test category 3",
        parent_id: cat1b.id,
      });

      const catWithAncestors = await categoryService.getCategoryAncestors(
        cat1c.id,
      );
      expect(catWithAncestors).toEqual([
        {
          id: 1,
          category_name: "Test category 1",
          parent_id: null,
          depth: 3,
          parent_name: null,
        },
        {
          id: 2,
          category_name: "Test category 2",
          parent_id: 1,
          depth: 2,
          parent_name: "Test category 1",
        },
        {
          id: 3,
          category_name: "Test category 3",
          parent_id: 2,
          depth: 1,
          parent_name: "Test category 2",
        },
      ]);
    });
  });

  describe("getAllCategoriesWithAncestors()", () => {
    it("should return all records with ancestry data from itself to the most distant ancestor", async () => {
      const cat1a = await categoryService.create({
        category_name: "Test category 1",
      });
      const cat1b = await categoryService.create({
        category_name: "Test category 2",
        parent_id: cat1a.id,
      });
      await categoryService.create({
        category_name: "Test category 3",
        parent_id: cat1b.id,
      });
      await categoryService.create({
        category_name: "Test category 4",
        parent_id: null,
      });

      const catWithAncestors =
        await categoryService.getAllCategoriesWithAncestors();
      expect(catWithAncestors).toMatchObject([
        { id: 1, ancestors: [{ id: 1 }] },
        { id: 2, ancestors: [{ id: 1 }, { id: 2 }] },
        { id: 3, ancestors: [{ id: 1 }, { id: 2 }, { id: 3 }] },
        { id: 4, ancestors: [{ id: 4 }] },
      ]);
    });
  });

  describe("getDescendantIds()", () => {
    it("should return all records with ancestry data from itself to the most distant ancestor", async () => {
      const cat1a = await categoryService.create({
        category_name: "Test category 1",
      });
      const cat1b = await categoryService.create({
        category_name: "Test category 2",
        parent_id: cat1a.id,
      });
      await categoryService.create({
        category_name: "Test category 3",
        parent_id: cat1b.id,
      });

      const descendants = await categoryService.getDescendantIds(cat1a.id);
      expect(descendants).toEqual([2, 3]);
    });
  });

  describe("getById()", () => {
    it("should return data when ID is found", async () => {
      await categoryService.create({
        category_name: "First category",
      });
      await categoryService.create({
        category_name: "Second category",
      });

      expect(await categoryService.getById(2)).toMatchObject({
        category_name: "Second category",
      });
    });

    it("should return null when ID is not found", async () => {
      await categoryService.create({
        category_name: "First category",
      });
      await categoryService.create({
        category_name: "Second category",
      });

      expect(await categoryService.getById(3)).toBeNull();
    });
  });

  describe("update()", () => {
    it("should update only the specified ID", async () => {
      await categoryService.create({
        category_name: "First category",
      });
      await categoryService.create({
        category_name: "Second category (to be replaced)",
      });

      const result = await categoryService.update(2, {
        category_name: "Second category (new name)",
      });

      expect(result).toMatchObject({
        category_name: "Second category (new name)",
      });

      expect(await categoryService.getById(1)).toMatchObject({
        category_name: "First category",
      });

      expect(await categoryService.getById(2)).toMatchObject({
        category_name: "Second category (new name)",
      });
    });

    it("should return undefined when given a non-existent ID", async () => {
      await categoryService.create({
        category_name: "Test category",
      });
      const result = await categoryService.update(2, {
        category_name: "Non-existent category",
      });
      expect(result).toBeNull();
    });

    it("should throw an error if no category name is given", async () => {
      await categoryService.create({
        category_name: "Test category",
      });
      try {
        await categoryService.update(1);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain("category_name");
      }
    });

    it("should update the parent ID", async () => {
      await categoryService.create({
        category_name: "Child category",
      });
      await categoryService.create({
        category_name: "Parent category",
      });
      await categoryService.update(1, {
        parent_id: 2,
      });

      expect(await categoryService.getAll()).toMatchObject([
        {
          category_name: "Child category",
          id: 1,
          parent_id: 2,
          parent_name: "Parent category",
        },
        {
          category_name: "Parent category",
          id: 2,
          parent_id: null,
          parent_name: null,
        },
      ]);
    });
  });

  describe("deleteCatagory", () => {
    it("should delete only the specified record", async () => {
      await categoryService.create({
        category_name: "First category",
      });
      await categoryService.create({
        category_name: "Test category (to be deleted)",
      });
      await categoryService.create({
        category_name: "Second category",
      });

      const result = await categoryService.delete(2);
      expect(result.rowCount).toBe(1);

      expect(await categoryService.getAll()).toMatchObject([
        { category_name: "First category" },
        { category_name: "Second category" },
      ]);
    });

    it("should return rowCount === 0 when given ID is not found", async () => {
      await categoryService.create({
        category_name: "First category",
      });

      const result = await categoryService.delete(99);
      expect(result.rowCount).toBe(0);
    });
  });
});
