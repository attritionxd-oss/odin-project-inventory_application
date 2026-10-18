import { pool } from "#models/pool.js";
import format from "pg-format";

const productService = {
  create: async ({
    product_name,
    product_description,
    brand_id = null,
    supplier_id = null,
    category_id = null,
  }) => {
    const SQL = /* sql */ `
      INSERT INTO products (product_name, product_description, brand_id, supplier_id, category_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await pool.query(SQL, [
      product_name,
      product_description || null,
      brand_id || null,
      supplier_id || null,
      category_id || null,
    ]);
    return result;
  },

  getAll: async ({
    category_id,
    brand_id,
    supplier_id,
    includeDeleted = false,
    orderByField = "name",
    isOrderAscBool = true,
  } = {}) => {
    const isOrderAsc = isOrderAscBool ? "ASC" : "DESC";
    const orderByMap = {
      id: "p.id",
      brand: "b.brand_name",
      supplier: "s.supplier_name",
      category: "c.category_name",
      name: "p.product_name",
      created: "p.created_at",
      deleted: "p.deleted_at",
    };

    const targetSortColumn = orderByMap[orderByField] || "p.product_name";

    let query = /* sql */ `
      SELECT
        p.*,
        b.brand_name,
        s.supplier_name,
        c.category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1 = 1
    `;

    const params = [];

    if (!includeDeleted) {
      query += ` AND p.deleted_at IS NULL`;
    }
    if (category_id) {
      params.push(category_id);
      query += ` AND p.category_id = $${params.length}`;
    }
    if (brand_id) {
      params.push(brand_id);
      query += ` AND p.brand_id = $${params.length}`;
    }
    if (supplier_id) {
      params.push(supplier_id);
      query += ` AND p.supplier_id = $${params.length}`;
    }

    query += format(/* sql */ ` ORDER BY %s %s;`, targetSortColumn, isOrderAsc);

    const { rows: products } = await pool.query(query, params);
    return products;
  },

  getById: async (id) => {
    const SQL = /* sql */ `
      SELECT
        p.*,
        b.brand_name,
        s.supplier_name,
        c.category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
      `;
    const { rows: product } = await pool.query(SQL, [id]);
    return product[0] || null;
  },

  update: async (
    id,
    {
      product_name = null,
      product_description = null,
      brand_id = null,
      supplier_id = null,
      category_id = null,
    },
  ) => {
    let query = /* sql */ `UPDATE products SET`;
    const params = [];

    if (product_name) {
      params.push(product_name);
      query += ` product_name = $${params.length}`;
    }
    if (product_description) {
      params.push(product_description);
      query += params.length > 1 ? ", " : " ";
      query += `product_description = $${params.length}`;
    }
    if (brand_id) {
      params.push(brand_id);
      query += params.length > 1 ? ", " : " ";
      query += `brand_id = $${params.length}`;
    }
    if (supplier_id) {
      params.push(supplier_id);
      query += params.length > 1 ? ", " : " ";
      query += `supplier_id = $${params.length}`;
    }
    if (category_id) {
      params.push(category_id);
      query += params.length > 1 ? ", " : " ";
      query += `category_id = $${params.length}`;
    }
    params.push(id);
    query += ` WHERE id = $${params.length} AND deleted_at IS NULL RETURNING *;`;

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },

  softDelete: async (id) => {
    const SQL = /* sql */ `
      UPDATE products SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *;
    `;
    const result = await pool.query(SQL, [id]);
    return result;
  },

  restore: async (id) => {
    if (!id || id === "") throw new Error("`id` must be specified");
    const SQL = format(
      /* sql */ `
      UPDATE products SET deleted_at = NULL
      WHERE id = %L
      RETURNING *;
    `,
      id,
    );
    const result = await pool.query(SQL);
    return result;
  },
};

export default productService;
