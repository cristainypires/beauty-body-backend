import axios from "axios";

const baseURL = "http://localhost:3333";

async function testarConexoes() {
  console.log("🧪 Testando conexões do dashboard...\n");

  // 1. Teste de conexão básica
  try {
    console.log("1️⃣  Testando servidor base...");
    const res = await axios.get(`${baseURL}/`);
    console.log("✅ Servidor está ON:", res.data);
  } catch (error) {
    console.error("❌ Erro na conexão base:", error.message);
  }

  // 2. Teste rota de teste
  try {
    console.log("\n2️⃣  Testando rota /api/test/test...");
    const res = await axios.get(`${baseURL}/api/test/test`);
    console.log("✅ Agendamentos encontrados:", res.data.total);
    console.log("📋 Primeiros agendamentos:");
    res.data.agendamentos.slice(0, 2).forEach((ag) => {
      console.log(
        `  - ${ag.cliente_nome} | ${ag.funcionario_nome} | ${ag.nome_servico}`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao buscar agendamentos:", error.message);
  }

  // 3. Teste dashboard admin (sem autenticação)
  try {
    console.log("\n3️⃣  Testando /api/dashboard/admin (sem token)...");
    const res = await axios.get(`${baseURL}/api/dashboard/admin`);
    console.log("✅ Dashboard retornou dados:");
    console.log("   Clientes:", res.data.utilizadores.clientes);
    console.log("   Funcionários:", res.data.utilizadores.funcionarios);
    console.log("   Agendamentos:", res.data.agendamentos.length);
  } catch (error) {
    console.error(
      "❌ Erro no dashboard:",
      error.response?.status,
      error.message
    );
    if (error.response?.data) {
      console.error("   Resposta:", error.response.data);
    }
  }

  // 4. Teste dashboard funcionário
  try {
    console.log("\n4️⃣  Testando /api/dashboard/funcionario (sem token)...");
    const res = await axios.get(`${baseURL}/api/dashboard/funcionario`);
    console.log("✅ Dashboard funcionário retornou:", res.data);
  } catch (error) {
    console.error(
      "❌ Erro no dashboard funcionário:",
      error.response?.status,
      error.message
    );
  }

  console.log("\n✅ Teste de debug concluído!");
}

testarConexoes();
