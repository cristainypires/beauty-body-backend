import express from "express";
import admin_Controller from "../controllers/admin.controller.js";
import { autenticar } from "../middlewares/auth.js";
import RoleMiddleware from "../middlewares/RoleMiddleware.js"; // Importe aqui

const router = express.Router();

router.use(autenticar);
router.use(RoleMiddleware("admin"));
// Serviços
router.get("/servicos", admin_Controller.listar_servicos);
router.post("/servicos", admin_Controller.criar_servico);
router.put("/servicos/:id", admin_Controller.atualizar_servico);
router.delete("/servicos/:id", admin_Controller.remover_servico);

// Funcionários
router.get("/funcionarios", admin_Controller.listar_funcionarios);
router.post("/funcionarios", admin_Controller.criar_funcionario);
router.put("/funcionarios/:id", admin_Controller.atualizar_funcionario);
router.delete("/funcionarios/:id", admin_Controller.remover_funcionario);

// Clientes
router.get("/clientes", admin_Controller.listar_clientes);
router.post("/clientes/:id/ativar", admin_Controller.ativar_cliente);
router.post("/clientes/:id/desativar", admin_Controller.desativar_cliente);

// Agendamentos
// admin.routes.js
router.get("/agendamentos", admin_Controller.listar_agendamentos); // Sem o prefixo /admin aqui
router.patch(
  "/agendamentos/:id/cancelar",
  admin_Controller.cancelar_agendamento,
);
router.patch(
  "/agendamentos/:id/reagendar",
  admin_Controller.reagendar_agendamento,
);

// Promoções
router.get("/promocoes", admin_Controller.listar_promocoes);
router.post("/promocoes", admin_Controller.criar_promocao);
router.put("/promocoes/:id", admin_Controller.atualizar_promocao);

// Auditoria / Logs
router.get("/logs", admin_Controller.visualizar_logs);

export default router;
