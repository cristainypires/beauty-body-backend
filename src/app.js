import express from "express";
import { appointmentSchema } from "./validators/appointment.schema.js";
import { verificarConflito } from "./utils/dateRules.js";

const app = express();
app.use(express.json());

app.post("/agendamentos", async (req, res) => {
  const dados = appointmentSchema.safeParse(req.body);
  if (!dados.success) return res.status(400).json(dados.error);

  const conflito = await verificarConflito(
    dados.data.funcionario_id,
    dados.data.data_hora_inicio
  );

  if (conflito)
    return res.status(400).json({ error: "Horário indisponível" });

  res.json({ message: "Agendamento válido" });
});

app.listen(3000);
