
import express from "express";
import { dashboard_funcionario, dashboard_admin } from "../controllers/dashboard.controller.js";
import auth from "../middlewares/auth.js";
import { verificarPerfil } from "../middlewares/rbac.js";

const router = express.Router();

// DASHBOARD FUNCIONÁRIO
router.get(
  "/funcionario",
  auth,
  verificarPerfil(["funcionario", "admin"]),
  dashboard_funcionario
);

// DASHBOARD ADMIN
router.get(
  "/admin",
  auth,
  verificarPerfil(["admin"]),
  dashboard_admin
);

export default router;
