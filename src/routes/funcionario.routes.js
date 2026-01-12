import express from "express";

import funcionario_Controller from "../controllers/funcionario.controller.js";
import agendamento_Controller from "../controllers/agendamento.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();



router.use(auth);

// Disponibilidade
router.post("/disponibilidade", funcionario_Controller.marcar_disponibilidade);
router.post("/ferias",funcionario_Controller.marcar_ferias);
router.post("/bloquear-horario", funcionario_Controller.bloquear_horario);

// Agenda
router.get("/listar-agendamentos", funcionario_Controller.ver_minha_agenda);// so agamendamentos de hoje e futuros
router.patch("/agendamentos/:agendamento_id/concluir", funcionario_Controller.concluir_servico);// so agendamentos comfirmados


// Histórico
router.get("/historico", funcionario_Controller.ver_historico_pessoal);// so agendamentos passados

// Regras sobre agendamento
router.post("/agendamentos", agendamento_Controller.fazer_agendamento);
router.patch("/agendamentos/:id/cancelar", agendamento_Controller.cancelar);// so agendamentos confirmados
router.patch("/agendamentos/:id/reagendar", agendamento_Controller.reagendar); //so agendamentos comfirmados

export default router;