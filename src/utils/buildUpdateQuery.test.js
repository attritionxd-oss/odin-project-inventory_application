import format from "pg-format";
import { buildUpdateQuery } from "#utils/buildUpdateQuery.js";

describe("pg-format", () => {
  it("formats a query", () => {
    const SQL = format(
      /* sql */ `
        SELECT *
        FROM suppliers
        WHERE id = %L
      `,
      42,
    );
    expect(SQL).toContain("WHERE id = '42'");
  });
});

describe("buildUpdateQuery utility", () => {
  it("throws when passed an empty updates object", () => {
    try {
      buildUpdateQuery("suppliers", {}, "id", 1);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("No valid fields to update");
    }
  });

  it("should construct a valid UPDATE query skipping undefined values", () => {
    const updates = {
      supplier_name: "Acme Corp",
      contact_email: undefined,
    };

    const query = buildUpdateQuery("suppliers", updates, "id", 1);

    expect(query).toContain(
      "UPDATE suppliers SET supplier_name = 'Acme Corp' WHERE id = '1'",
    );
  });

  it("should construct a valid UPDATE query including null values", () => {
    const updates = {
      supplier_name: "Acme Corp",
      contact_email: null,
    };

    const query = buildUpdateQuery("suppliers", updates, "id", 1);

    expect(query).toContain(
      "UPDATE suppliers SET supplier_name = 'Acme Corp', contact_email = NULL WHERE id = '1'",
    );
  });
});
