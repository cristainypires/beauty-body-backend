const express = require("express");
const router = express.Router();
const agendamento_Controller = require("../controllers/agendamento.controller");
const auth = require("../middleware/auth");

router.use(auth);

// Núcleo do agendamento
router.post("/", agendamento_Controller.fazer_agendamento);
router.patch("/:id/confirmar", agendamento_Controller.confirmar);
router.patch("/:id/cancelar", agendamento_Controller.cancelar);
router.patch("/:id/reagendar", agendamento_Controller.reagendar);
router.get("/meus", agendamento_Controller.listar_agendamentos);




module.exports = router;
