import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./models/index.js";
import { setupDatabase } from "./database/connect.js";

// Importação das Rotas
import authRoutes from "./routes/AuthRoutes.js";
import adminRoutes from "./routes/admin.routes.js";
import funcionarioRoutes from "./routes/funcionario.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import agendamentoRoutes from "./routes/agendamento.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import sistemaRoutes from "./routes/sistema.routes.js";

// Importação do Escalonador (Cron)
import { iniciarEscalonador } from "./utils/scheduler.js";

dotenv.config();

const app = express();

// --- MIDDLEWARES GLOBAIS ---

app.use(cors()); // Libera o acesso do dashboard
app.use(express.json()); // ESSA LINHA É A MAIS IMPORTANTE
app.use(express.urlencoded({ extended: true }));
// --- ROTA DE BOAS-VINDAS ---
app.get("/", (req, res) => {
  res.json({ message: "Back End de Maddie Beauty Boutique está ON 🚀" });
});

// --- DEFINIÇÃO DAS ROTAS DA API ---

// Autenticação (Login e futuramente Registro)
app.use("/auth", authRoutes);

// Dashboards (Métricas para cada perfil)
app.use("/dashboard", dashboardRoutes);

// Administração (Controle de serviços, funcionários e logs)
app.use("/admin", adminRoutes);

// Funcionário (Agenda diária e disponibilidade)
app.use("/funcionario", funcionarioRoutes);

// Cliente (Listar serviços e histórico)
app.use("/cliente", clienteRoutes);

// Agendamentos (O núcleo de marcação, cancelamento e reagendamento)
app.use("/agendamentos", agendamentoRoutes);

// Sistema (Rotinas automáticas e manuais)
app.use("/sistema", sistemaRoutes);

// --- TRATAMENTO DE ROTAS NÃO ENCONTRADAS (404) ---
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

// --- TRATAMENTO GLOBAL DE ERROS ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: "Erro interno no servidor." });
});

// --- INICIALIZAÇÃO ---
const PORT = process.env.PORT || 3333;

async function iniciarServidor() {
  try {
    console.log("🔄 Sincronizando models com banco de dados...");
    await sequelize.sync({ force: false, alter: false });
    console.log("✅ Models sincronizados!");

    await setupDatabase();

    app.listen(PORT, () => {
      console.log(`--------------------------------------------------`);
      console.log(`🚀 Servidor a correr na porta ${PORT}`);

      // Inicia as rotinas automáticas (limpeza, lembretes, etc)
      iniciarEscalonador();

      console.log(`✅ Rotinas automáticas do sistema iniciadas.`);
      console.log(`--------------------------------------------------`);
    });
  } catch (erro) {
    console.error("❌ Erro ao iniciar servidor:", erro);
    process.exit(1);
  }
}

iniciarServidor();
