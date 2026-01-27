import pkg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
});

export async function setupDatabase() {
  try {
    console.log("🔌 Conectando ao banco de dados...");

    // Testa a conexão
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Conexão estabelecida com sucesso!");
    console.log("📅 Hora do servidor:", res.rows[0]);

    // Lê o arquivo de setup
    const __filename = new URL(import.meta.url).pathname.replace(
      /^\/([A-Z]:)/,
      "$1"
    );
    const __dirname = path.dirname(__filename);
    const setupPath = path.join(__dirname, "setup.sql");

    if (!fs.existsSync(setupPath)) {
      console.warn("⚠️  Arquivo setup.sql não encontrado. Pulando...");
      console.log("✅ Banco de dados pronto!");
      return;
    }

    const setupSQL = fs.readFileSync(setupPath, "utf-8");

    console.log("\n📋 Executando script de setup...");
    await pool.query(setupSQL);
    console.log("✅ Tabelas criadas com sucesso!");

    console.log("✅ Banco de dados pronto!");
  } catch (error) {
    console.error("❌ Erro na conexão:", error.message);
    throw error;
  }
}

export default pool;
