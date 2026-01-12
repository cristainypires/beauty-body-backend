import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 1. TODOS OS IMPORTS NO TOPO
import authRoutes from "./routes/AuthRoutes.js";
import agendamentoRoutes from "./routes/Agendamento.js";
import adminRoutes from "./routes/AdminRoute.js";

// 2. CONFIGURAÇÕES INICIAIS
dotenv.config();
const app = express();

// 3. MIDDLEWARES GLOBAIS (Devem vir ANTES das rotas)
app.use(cors());            // Ativa o CORS para todas as requisições
app.use(express.json());    // Permite que o servidor entenda JSON

// 4. DEFINIÇÃO DE ROTAS
app.use("/api", authRoutes);
app.use("/api", agendamentoRoutes);
app.use("/api", adminRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "Back End de Maddie Beauty Boutique está ON 🚀" });
});

// 5. INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});