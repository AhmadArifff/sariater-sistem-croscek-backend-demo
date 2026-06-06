import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const migrationsDir = path.join(rootDir, "migrations");

dotenv.config({ path: path.join(rootDir, ".env") });

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString || connectionString.includes("[YOUR-PASSWORD]")) {
  console.error("SUPABASE_DB_URL belum diisi dengan password database Supabase.");
  console.error("Edit backend/.env, ganti [YOUR-PASSWORD] pada SUPABASE_DB_URL, lalu jalankan ulang.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function ensureMigrationTable() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const { rows } = await client.query("SELECT filename FROM schema_migrations");
  return new Set(rows.map((row) => row.filename));
}

async function runMigration(filename) {
  const filePath = path.join(migrationsDir, filename);
  const sql = await fs.readFile(filePath, "utf8");

  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [filename]);
    await client.query("COMMIT");
    console.log(`Applied ${filename}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`Failed ${filename}`);
    throw error;
  }
}

async function main() {
  await client.connect();
  try {
    await ensureMigrationTable();
    const applied = await getAppliedMigrations();
    const files = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipped ${file}`);
        continue;
      }
      await runMigration(file);
    }

    console.log("Database migrations complete.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
