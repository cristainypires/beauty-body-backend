const express = require("express");
const router = express.Router();

const cliente_Controller = require("../controllers/cliente.controller");
const agendamento_Controller = require("../controllers/agendamento.controller");
const auth = require("../middleware/auth");

// Todas as rotas do cliente exigem login
router.use(auth);

// Visibilidade
router.get("/servicos", cliente_Controller.listar_servicos_disponiveis);
router.get("/servicos/:servico_id/profissionais", cliente_Controller.listar_profissionais_por_servico);
router.get("/horarios-livres", cliente_Controller.consultar_horarios_livres);

// Agendamentos
router.post("/agendamentos", agendamento_Controller.fazer_agendamento);
router.get("/listar-agendamentos", agendamento_Controller.listar_agendamentos);
router.patch("/agendamentos/:id/cancelar", agendamento_Controller.cancelar);
router.patch("/agendamentos/:id/reagendar", agendamento_Controller.reagendar);

module.exports = router;
