import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize } from "sequelize"; // 1. Importe o Sequelize

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const { Pool } = pkg;

// Configuração do Pool (Consultas Manuais)
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD),
});

export const query = (text, params) => pool.query(text, params);

// 2. Inicialize a instância do Sequelize
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER || "postgres",
  String(process.env.DB_PASSWORD),
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false, // Defina como true se quiser ver os SQLs no terminal
  }
);

// 3. Exporte o sequelize como default ou nomeado
export default sequelize;