import express from "express";
import {
  dashboard_funcionario,
  dashboard_admin,
  dashboard_cliente
} from "../controllers/dashboard.controller.js";
import auth from "../middlewares/auth.js";
import RoleMiddleware from "../middlewares/RoleMiddleware.js";

const router = express.Router();

router.use(auth); // Todos precisam de login

router.get("/funcionario", RoleMiddleware(["funcionario", "profissional"]), dashboard_funcionario);
router.get("/admin", RoleMiddleware(["admin"]), dashboard_admin);
router.get("/cliente", RoleMiddleware(["cliente"]), dashboard_cliente);

export default router;