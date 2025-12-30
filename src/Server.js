import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/AuthRoutes.js";
import agendamentosRoutes from "./routes/Agendamento.js";
import adminRoutes from "./routes/AdminRoute.js";


dotenv.config({ path: "./variaveis.env" });
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api", authRoutes);
app.use("/api", agendamentosRoutes);
app.use ("/api", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Beauty Body API está online 🚀" });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
