import { Pool } from "pg"; // ou outro client que você use

const pool = new Pool({
  user: "seu_usuario",
  host: "localhost",
  database: "beautybody",
  password: "sua_senha",
  port: 5432
});

export default pool;
