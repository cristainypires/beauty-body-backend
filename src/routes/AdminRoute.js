import { Router } from "express";
import { autenticar } from "../middlewares/AuthMiddleware.js";
import { autorizar } from "../middlewares/RoleMiddleware.js";


const router = Router();

router.get(
  "/admin/dashboard",
  autenticar,
  autorizar("admin"),
  (req, res) => {
    return res.json({
      success: true,
      code: "ADMIN_DASHBOARD_OK",
      message: "Área administrativa acessada com sucesso",
      user: req.usuario
    });
  }
);

export default router;
