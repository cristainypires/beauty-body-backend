import express from "express";
import agendamento_Controller from "../controllers/agendamento.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.use(auth);

router.post("/", agendamento_Controller.fazer_agendamento);
router.get("/meus", agendamento_Controller.listar_agendamentos);
router.patch("/:id/confirmar", agendamento_Controller.confirmar);
router.patch("/:id/cancelar", agendamento_Controller.cancelar);
router.patch("/:id/reagendar", agendamento_Controller.reagendar);

export default router;