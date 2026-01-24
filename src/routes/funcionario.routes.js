import express from "express";

import funcionarioController from "../controllers/funcionario.controller.js";
import agendamento_Controller from "../controllers/agendamento.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Todas as rotas abaixo exigem login
router.use(auth);

// Agenda
router.get("/listar-agendamentos", funcionarioController.ver_minha_agenda);

// Disponibilidade
router.post("/disponibilidade", funcionarioController.marcar_disponibilidade);
router.post("/bloquear-horario", funcionarioController.bloquear_horario);
router.post("/ferias", funcionarioController.marcar_ferias);

// Concluir agendamento
router.patch(
  "/agendamentos/:agendamento_id/concluir",
  funcionarioController.concluir_servico
);

// Histórico
router.get("/historico", funcionarioController.ver_historico_pessoal);
router.get("/perfil-resumo", funcionarioController.perfil_resumo);
router.get("/perfil", funcionarioController.perfil_resumo);

// Regras sobre agendamento
router.post("/agendamentos", agendamento_Controller.fazer_agendamento);
router.patch("/agendamentos/:id/cancelar", agendamento_Controller.cancelar);
router.patch("/agendamentos/:id/reagendar", agendamento_Controller.reagendar);


// relatorio_financeiro ver_historico_pessoal
router.get("/relatorio-financeiro", funcionarioController.relatorio_financeiro);

export default router;
