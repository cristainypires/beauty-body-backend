import express from "express";
               
import admin_Controller from "../controllers/admin.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.use(auth);


//servicos
router.get("/servicos", admin_Controller.listar_servicos);            
router.post("/servicos", admin_Controller.criar_servico);             
router.put("/servicos/:servico_id", admin_Controller.atualizar_servico); 
router.delete("/servicos/:servico_id", admin_Controller.remover_servico); 

//funcionario
router.get("/funcionarios", admin_Controller.listar_funcionarios);           
router.post("/funcionarios", admin_Controller.criar_funcionario);            
router.put("/funcionarios/:funcionario_id", admin_Controller.atualizar_funcionario); 
router.delete("/funcionarios/:funcionario_id", admin_Controller.remover_funcionario); 

//clientes
router.get("/clientes", admin_Controller.listar_clientes);       
router.delete("/clientes/:cliente_id", admin_Controller.desativar_cliente); 

//agendamentos
router.get("/agendamentos", admin_Controller.listar_agendamentos);         
router.patch("/agendamentos/:agendamento_id/cancelar", admin_Controller.cancelar_agendamento); //so agendamentos comfirmados
router.patch("/agendamentos/:agendamento_id/reagendar", admin_Controller.reagendar_agendamento); //so agendamentos confirmados




export default router;