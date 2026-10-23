/**
 * Database transaction boundary. Always use one checked-out client for the entire
 * transaction; no network/provider effects are permitted within callbacks.
 */
export async function withTransaction(pool, operation) {
  if (!pool || typeof pool.connect !== "function" || typeof operation !== "function") {
    throw new TypeError("A pool and transaction operation are required");
  }
  const client = await pool.connect();
  let begun = false;
  try {
    await client.query("BEGIN");
    begun = true;
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    if (begun) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Do not hide the original failure; callers must treat the connection as unhealthy.
      }
    }
    throw error;
  } finally {
    client.release();
  }
}
