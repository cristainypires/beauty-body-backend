import express from "express";
import cliente_Controller from "../controllers/cliente.controller.js";
import agendamento_Controller from "../controllers/agendamento.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Todas as rotas do cliente exigem login
router.use(auth);

// Visibilidade e Busca
router.get("/servicos", cliente_Controller.listar_servicos_disponiveis);
// ADICIONADO: Rota que estava no controller mas não aqui
router.get("/servicos/:servico_id/profissionais", cliente_Controller.listar_profissionais_por_servico);
// Procure esta linha e mude de 'horarios-livres' para 'horarios-disponiveis'
router.get("/horarios-disponiveis", cliente_Controller.consultar_horarios_livres);
// Meus Agendamentos
router.get("/meus-agendamentos", cliente_Controller.listar_agendamentos);
router.post("/feedback/:agendamento_id", cliente_Controller.feedback_servico);

// Lógica de Agendamento
router.post("/agendamentos", agendamento_Controller.fazer_agendamento);
router.patch("/agendamentos/:id/cancelar", agendamento_Controller.cancelar);
router.patch("/agendamentos/:id/reagendar", agendamento_Controller.reagendar);

export default router;