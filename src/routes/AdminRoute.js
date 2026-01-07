import { Router } from "express";
import { autenticar } from "../middleware/AuthMiddleware.js";
import { autorizar } from "../middleware/RoleMiddleware.js";


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
