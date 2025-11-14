import { Pool } from "pg";
import { config } from "dotenv";

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback to individual variables if DATABASE_URL is not set (e.g., for local development)
  // These will be ignored if connectionString is present
  user: process.env.DB_USER || "user",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "fuel_eu_maritime",
  password: process.env.DB_PASSWORD || "password",
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

export default pool;
