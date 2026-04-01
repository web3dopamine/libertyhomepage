import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require") ||
       process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("[pg-backend] Unexpected pool error:", err.message);
});

export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function loadState(): Promise<Record<string, unknown> | null> {
  try {
    const result = await pool.query(
      "SELECT data FROM app_state WHERE key = $1",
      ["main"]
    );
    if (result.rows.length > 0) {
      return result.rows[0].data as Record<string, unknown>;
    }
    return null;
  } catch (err) {
    console.error("[pg-backend] loadState error:", (err as Error).message);
    return null;
  }
}

export async function saveState(data: Record<string, unknown>): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO app_state (key, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      ["main", JSON.stringify(data)]
    );
  } catch (err) {
    console.error("[pg-backend] saveState error:", (err as Error).message);
  }
}

export { pool };
