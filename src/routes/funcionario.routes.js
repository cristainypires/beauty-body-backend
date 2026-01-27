import express from "express";
import funcionarioController from "../controllers/funcionario.controller.js";
import agendamento_Controller from "../controllers/agendamento.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Todas as rotas abaixo exigem login
router.use(auth);

// --- AGENDAMENTOS ---
router.get("/listar-agendamentos", funcionarioController.ver_minha_agenda);
router.post("/agendamentos", agendamento_Controller.fazer_agendamento);
router.patch("/agendamentos/:id/cancelar", agendamento_Controller.cancelar);
router.patch("/agendamentos/:id/reagendar", agendamento_Controller.reagendar);
router.patch("/agendamentos/:agendamento_id/concluir", funcionarioController.concluir_servico);

// --- BUSCAS PARA O FORMULÁRIO (Nova Marcação) ---
router.get("/servicos", funcionarioController.listarServicos);
router.get("/profissionais", funcionarioController.listarProfissionais);
router.get("/clientes", funcionarioController.listarClientes);



// --- OUTROS ---
router.get("/historico", funcionarioController.ver_historico_pessoal);
router.get("/perfil-resumo", funcionarioController.perfil_resumo);
router.get("/relatorio-financeiro", funcionarioController.relatorio_financeiro);

// Obter disponibilidade de um profissional específico
router.get("/adm/disponibilidade/:funcionario_id", funcionarioController.get_disponibilidade);

// Salvar agenda semanal (Lida com o funcionario_id vindo no body)
router.post("/adm/disponibilidade", funcionarioController.marcar_disponibilidade);

// Bloquear horário específico
router.post("/bloquear-horario", funcionarioController.bloquear_horario);
router.post("/ferias", funcionarioController.marcar_ferias);


router.get("/panorama/:funcionario_id", funcionarioController.obter_panorama_completo);


export default router;