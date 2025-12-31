import express from "express";

import funcionario_Controller from "../controllers/funcionario.controller.js";
import agendamento_Controller from "../controllers/agendamento.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();


// Todas as rotas exigem login
router.use(auth);

// Disponibilidade
router.post("/disponibilidade", funcionario_Controller.marcar_disponibilidade);
router.post("/bloquear-horario", funcionario_Controller.bloquear_horario);

// Agenda
router.get("/listar-agendamentos", funcionario_Controller.ver_minha_agenda);
router.patch("/agendamentos/:agendamento_id/concluir", funcionario_Controller.concluir_servico);
// Histórico
router.get("/historico", funcionario_Controller.ver_historico_pessoal);

// Regras sobre agendamento
router.patch("/agendamentos/:id/cancelar", agendamento_Controller.cancelar);
router.patch("/agendamentos/:id/reagendar", agendamento_Controller.reagendar);

export default router;