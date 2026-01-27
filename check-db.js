import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "maddietavaresDB",
  user: "postgres",
  password: "nova_senha",
});

(async () => {
  try {
    console.log("Verificando dados na base...\n");

    const usuarioRes = await pool.query(
      "SELECT COUNT(*) as total FROM usuario"
    );
    console.log("📊 Total de usuários:", usuarioRes.rows[0].total);

    const adminRes = await pool.query(
      "SELECT id, nome, email, usuario_tipo FROM usuario WHERE usuario_tipo = $1",
      ["admin"]
    );
    console.log("👨‍💼 Admins:", adminRes.rows);

    const clienteRes = await pool.query(
      "SELECT COUNT(*) as total FROM cliente"
    );
    console.log("👥 Total de clientes:", clienteRes.rows[0].total);

    const agendRes = await pool.query(
      "SELECT COUNT(*) as total FROM agendamento"
    );
    console.log("📅 Total de agendamentos:", agendRes.rows[0].total);

    const servicoRes = await pool.query(
      "SELECT COUNT(*) as total FROM servico"
    );
    console.log("💅 Total de serviços:", servicoRes.rows[0].total);

    await pool.end();
    console.log("\n✅ Verificação concluída!");
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  }
})();
