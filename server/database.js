import pg from "pg";

export function createDatabaseReadiness(databaseUrl, poolFactory = (options) => new pg.Pool(options)) {
  if (!databaseUrl) {
    return {
      check: async () => false,
      close: async () => {},
    };
  }

  const pool = poolFactory({
    connectionString: databaseUrl,
    max: 2,
    connectionTimeoutMillis: 1000,
    idleTimeoutMillis: 1000,
    query_timeout: 1000,
  });

  return {
    async check() {
      await pool.query("SELECT 1");
      return true;
    },
    async close() {
      await pool.end();
    },
  };
}
