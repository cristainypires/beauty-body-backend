import { Router } from "express";
import { login, registro } from "../controllers/AuthController.js"; // Adicionei 'registro' aqui
import { loginSchema } from "../validators/LoginValidator.js";

const router = Router();

// --- ROTA DE LOGIN ---
router.post("/login", (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(result.error);
  }

  login(req, res);
});

// --- ROTA DE REGISTRO (Adicionada agora) ---
router.post("/registrar", (req, res) => {
  // Chamando a função registro que configuramos anteriormente no controlador
  registro(req, res);
});

export default router;