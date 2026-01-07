import { Router } from "express";
import { login } from "../controllers/AuthController.js";
import { loginSchema } from "../validators/LoginValidator.js";

const router = Router();

router.post("/login", (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(result.error);
  }

  login(req, res);
});

export default router;
