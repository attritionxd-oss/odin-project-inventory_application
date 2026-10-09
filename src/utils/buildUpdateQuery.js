import format from "pg-format";

export function buildUpdateQuery(table, updates, idField = "id", idValue) {
  const setClauses = [];

  for (const [field, value] of Object.entries(updates)) {
    if (value !== undefined) {
      setClauses.push(format("%I = %L", field, value));
    }
  }

  if (setClauses.length === 0) {
    throw new Error("No valid fields to update");
  }

  const query = format(
    /* sql */ `
      UPDATE %I SET %s WHERE %I = %L RETURNING *;
      `,
    table,
    setClauses.join(", "),
    idField,
    idValue,
  );

  return query;
}
