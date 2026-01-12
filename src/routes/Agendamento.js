import { Router } from "express";
import { autenticar } from "../middlewares/AuthMiddleware.js";
import { autorizar } from "../middlewares/RoleMiddleware.js";

const router = Router();

router.get(
  "/agendamentos",
  autenticar,
  autorizar("admin"),
  (req, res) => {
    res.json({ message: "Lista de agendamentos obtida com sucesso utilizando ADMIN" });
  },
  
);
router.get(
  "/agendamentos/funcionario",
  autenticar,
  autorizar("funcionario"),
  (req, res) => {
    res.json({ message: "Lista de agendamentos obtida com sucesso utilizando perfil FUNCIONARIO" });
  },
  
);

export default router;
