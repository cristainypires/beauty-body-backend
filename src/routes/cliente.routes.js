import express from "express";
import cliente_Controller from "../controllers/cliente.controller.js";
import agendamento_Controller from "../controllers/agendamento.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Todas as rotas do cliente exigem login
router.use(auth);

// Visibilidade e Busca
router.get("/servicos", cliente_Controller.listar_servicos_disponiveis);
router.get("/horarios-livres", cliente_Controller.consultar_horarios_livres);

// Meus Agendamentos (Cliente vê os dele)
router.get("/meus-agendamentos", cliente_Controller.listar_agendamentos);
router.post("/feedback/:agendamento_id", cliente_Controller.feedback_servico);

// Lógica de Agendamento (Centralizada)
router.post("/agendamentos", agendamento_Controller.fazer_agendamento);
router.patch("/agendamentos/:id/cancelar", agendamento_Controller.cancelar);
router.patch("/agendamentos/:id/reagendar", agendamento_Controller.reagendar);

export default router;