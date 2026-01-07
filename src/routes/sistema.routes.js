import express from "express";
const router = express.Router();
import auth from "../middlewares/auth.js";
import sistema_Controller from "../controllers/sistema.controller.js";

router.use(auth);

// Rotas manuais para testar/acionar as rotinas
router.post("/limpar-pendentes", async (req, res) => {
  await sistema_Controller.rotina_limpar_pendentes();
  res.json({ mensagem: "Rotina de limpeza executada." });
});

router.post("/concluir-servicos", async (req, res) => {
  await sistema_Controller.rotina_mudar_status_concluido();
  res.json({ mensagem: "Rotina de conclusão executada." });
});

router.post("/lembretes-24h", async (req, res) => {
  await sistema_Controller.lembrete_24h();
  res.json({ mensagem: "Lembretes enviados." });
});

router.post("/aniversariantes", async (req, res) => {
  await sistema_Controller.parabens_aniversariantes();
  res.json({ mensagem: "Notificações de aniversariantes enviadas." });
});

router.post("/promocoes", async (req, res) => {
  const { titulo, mensagem } = req.body;
  await sistema_Controller.enviar_promocao_geral(titulo, mensagem);
  res.json({ mensagem: "Promoções enviadas." });
});

export default router;