import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // carrega o .env

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
});

export const query = (text, params) => pool.query(text, params);
