import { Pool } from "pg";
import { config } from "dotenv";

config();

// Determine if we need SSL based on the database URL
// Render and other cloud databases require SSL even in development
const databaseUrl = process.env.DATABASE_URL || "";
const needsSSL =
  databaseUrl.includes("render.com") ||
  databaseUrl.includes("amazonaws.com") ||
  (!databaseUrl.includes("localhost") && databaseUrl.length > 0);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSSL
    ? { rejectUnauthorized: false } // Cloud databases require SSL
    : false, // Local databases don't need SSL
});

export default pool;
