jest.mock("pg", () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
    end: jest.fn().mockResolvedValue(undefined),
  };

  return {
    Pool: jest.fn(() => mockPool),
  };
});

describe("Test environment variable mounting", () => {
  it("runs on a test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(process.env.DATABASE_URL).toBe(
      "postgresql://ace:alkalineReanalyzeSubgroupXD42@localhost:5432/odin__project__inventory_application_test",
    );
  });
});

describe("Database module (`src/shared/db/pool.js`)", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe("Environment variable validation", () => {
    it("should throw an error on import when both database URL variables are missing", async () => {
      delete process.env.DATABASE_URL_POOLED;
      delete process.env.DATABASE_URL;

      await expect(import("./pool.js")).rejects.toThrow(
        "Missing DATABASE_URL_POOLED or DATABASE_URL environment variable",
      );
    });

    it("should initialize Pool with DATABASE_URL_POOLED when present", async () => {
      process.env.DATABASE_URL_POOLED =
        "postgresql://user:pass@localhost:5432/pooled_db";
      process.env.DATABASE_URL =
        "postgresql://user:pass@localhost:5432/direct_db";

      const { Pool } = await import("pg");
      await import("./pool.js");

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString: "postgresql://user:pass@localhost:5432/pooled_db",
        }),
      );
    });

    it("should fall back to DATABASE_URL when DATABASE_URL_POOLED is not set", async () => {
      delete process.env.DATABASE_URL_POOLED;
      process.env.DATABASE_URL =
        "postgresql://user:pass@localhost:5432/fallback_db";

      const { Pool } = await import("pg");
      await import("./pool.js");

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString: "postgresql://user:pass@localhost:5432/fallback_db",
        }),
      );
    });

    it("should set rejectUnauthorized to true in a production environment", async () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@localhost:5432/production_db";
      process.env.NODE_ENV = "production";
      const { Pool } = await import("pg");
      await import("./pool.js");

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString:
            "postgresql://user:pass@localhost:5432/production_db",
          ssl: { rejectUnauthorized: true },
        }),
      );
    });
  });

  describe("initDb()", () => {
    beforeEach(() => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@localhost:5432/test_db";
    });

    it("should acquire a client, run 'SELECT 1;', and realease the client back to the pool", async () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      const { initDb, pool } = await import("./pool.js");

      await initDb();

      const client = await pool.connect();
      expect(pool.connect).toHaveBeenCalledTimes(2);
      expect(client.query).toHaveBeenCalledWith("SELECT 1;");
      expect(client.release).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Database connection established.",
      );

      consoleSpy.mockRestore();
    });

    it("should release the client even if the query throws an error", async () => {
      const { initDb, pool } = await import("./pool.js");
      const client = await pool.connect();

      client.query.mockRejectedValueOnce(
        new Error("Database connection failed"),
      );

      await expect(initDb()).rejects.toThrow("Database connection failed");

      expect(client.release).toHaveBeenCalledTimes(1);
    });
  });

  describe("closeDb()", () => {
    beforeEach(() => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@localhost:5432/test_db";
    });

    it("should shut down the connection pool and log status messages", async () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const { closeDb, pool } = await import("./pool.js");

      await closeDb();

      expect(pool.end).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Closing database connection pool...",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Database connection pool closed.",
      );

      consoleSpy.mockRestore();
    });
  });
});
