import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/AuthRoutes.js";
import agendamentosRoutes from "./routes/Agendamento.js";
import adminRoutes from "./routes/AdminRoute.js";

<<<<<<< HEAD

dotenv.config({ path: "./variaveis.env" });
=======
// IMPORTA AS TUAS ROTAS
import adminRoutes from "./routes/admin.routes.js";
import funcionarioRoutes from "./routes/funcionario.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js"; // IMPORTANTE
import agendamentoRoutes from "./routes/agendamento.routes.js";

>>>>>>> origin/main
dotenv.config();

const app = express();

// CONFIGURAÇÃO DO CORS (Para o React conseguir falar com o Node)
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());

<<<<<<< HEAD

app.use("/api", authRoutes);
app.use("/api", agendamentosRoutes);
app.use ("/api", adminRoutes);

=======
// ROTA DE TESTE
>>>>>>> origin/main
app.get("/", (req, res) => {
  res.json({ message: "Back End de Maddie Beauty Boutique está ON 🚀" });
});

// LIGAÇÃO DAS ROTAS (Prefixos para a API)
app.use("/api/admin", adminRoutes);
app.use("/api/funcionario", funcionarioRoutes);
app.use("/api/cliente", clienteRoutes);
app.use("/api/dashboard", dashboardRoutes); // <-- Esta é a que o Front-end chama
app.use("/api/agendamentos", agendamentoRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});