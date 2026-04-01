import pg from "pg";
const { Client } = pg;

export interface PgConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  connectionString: string;
}

let pgConfig: PgConfig = {
  host: process.env.PGHOST || "",
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || "",
  user: process.env.PGUSER || "",
  password: process.env.PGPASSWORD || "",
  ssl: process.env.PGSSLMODE === "require",
  connectionString: process.env.DATABASE_URL || "",
};

export function getPgConfig(): Omit<PgConfig, "password"> & { hasPassword: boolean; isConfigured: boolean } {
  const isConfigured = !!(
    pgConfig.connectionString ||
    (pgConfig.host && pgConfig.database && pgConfig.user)
  );
  return {
    host: pgConfig.host,
    port: pgConfig.port,
    database: pgConfig.database,
    user: pgConfig.user,
    hasPassword: !!pgConfig.password,
    ssl: pgConfig.ssl,
    connectionString: pgConfig.connectionString,
    isConfigured,
  };
}

export function updatePgConfig(updates: Partial<PgConfig>): void {
  pgConfig = { ...pgConfig, ...updates };
}

export async function testPgConnection(): Promise<{ success: boolean; message: string; version?: string }> {
  const cfg = pgConfig;
  if (!cfg.connectionString && !(cfg.host && cfg.database && cfg.user)) {
    return { success: false, message: "No connection details configured. Add a connection string or host/user/database." };
  }

  const client = new Client(
    cfg.connectionString
      ? { connectionString: cfg.connectionString, ssl: cfg.ssl ? { rejectUnauthorized: false } : false, connectionTimeoutMillis: 5000 }
      : {
          host: cfg.host,
          port: cfg.port,
          database: cfg.database,
          user: cfg.user,
          password: cfg.password,
          ssl: cfg.ssl ? { rejectUnauthorized: false } : false,
          connectionTimeoutMillis: 5000,
        }
  );

  try {
    await client.connect();
    const result = await client.query("SELECT version()");
    const version = (result.rows[0]?.version as string)?.split(" ").slice(0, 2).join(" ") ?? "PostgreSQL";
    await client.end();
    return { success: true, message: "Connection successful.", version };
  } catch (err: unknown) {
    try { await client.end(); } catch (_) {}
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message: msg };
  }
}
