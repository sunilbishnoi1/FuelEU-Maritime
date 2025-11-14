import { Pool } from "pg";
import { config } from "dotenv";

config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false } // Render/Postgres cloud requirement
    : false,                        // Local development uses no SSL
});

export default pool;
