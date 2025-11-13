import { Pool } from "pg";
import { config } from "dotenv";

config();

const pool = new Pool({
  user: process.env.DB_USER || "user",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "fuel_eu_maritime",
  password: process.env.DB_PASSWORD || "password",
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

export default pool;
