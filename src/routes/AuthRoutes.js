import { Router } from "express";
import { login } from "../controllers/AuthController.js";
import { loginSchema } from "../validators/LoginValidator.js";

const router = Router();

router.post("/login", (req, res) => {
  // 🔎 Validação com Zod
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: result.error.format(),
    });
  }

  // 🔁 Substitui o body pelos dados validados
  req.body = result.data;

  // Chama o controller
  return login(req, res);
});

export default router;
