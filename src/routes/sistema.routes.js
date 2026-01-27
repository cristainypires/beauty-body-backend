import express from "express";
import sistema_Controller from "../controllers/sistema.controller.js";
import auth from "../middlewares/auth.js";
import RoleMiddleware from "../middlewares/RoleMiddleware.js";

const router = express.Router();

// Apenas Admin pode disparar rotinas manuais
router.use(auth, RoleMiddleware(["admin"]));

router.post("/limpar-pendentes", async (req, res) => {
  await sistema_Controller.rotina_limpar_pendentes();
  res.json({ mensagem: "Limpeza de pendentes concluída." });
});

router.post("/concluir-servicos", async (req, res) => {
  await sistema_Controller.rotina_mudar_status_concluido();
  res.json({ mensagem: "Status de serviços antigos atualizados." });
});

router.post("/lembretes-24h", async (req, res) => {
  await sistema_Controller.lembrete_24h();
  res.json({ mensagem: "Lembretes processados." });
});

router.post("/aniversariantes", async (req, res) => {
  await sistema_Controller.parabens_aniversariantes();
  res.json({ mensagem: "Aniversariantes notificados." });
});

export default router;