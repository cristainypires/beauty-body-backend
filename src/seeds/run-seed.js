import dotenv from "dotenv";
import populateData from "./populateData.js";
import { pool } from "../database/index.js";

dotenv.config();

async function runSeed() {
  try {
    console.log("🌱 Iniciando seed...\n");
    await populateData();
    console.log("✅ Seed concluído com sucesso!");
    process.exit(0);
  } catch (erro) {
    console.error("❌ Erro ao executar seed:", erro);
    process.exit(1);
  }
}

runSeed();
