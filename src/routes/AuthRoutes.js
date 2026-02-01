import { Router } from "express";
import { login, registrar } from "../controllers/AuthController.js";

const router = Router();

// ✅ AGORA SIM: A rota chama diretamente a função que faz o SQL e dá o Token
router.post("/login", login);

// ✅ Rota de registro
router.post("/registrar", registrar);

export default router;