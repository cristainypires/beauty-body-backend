import { Op } from "sequelize";
import { 
  Agendamento, 
  Servico, 
  Funcionario, 
  Cliente, 
  StatusAgendamento, 
  AgendaFuncionario, 
  Usuario 
} from "../models/index.js";
import sequelize from "../config/database.js";

const agendamento_Controller = {

  // --- FUNÇÕES AUXILIARES ---
  async _getClienteId(usuario_id) {
    const c = await Cliente.findOne({ where: { usuario_id } });
    return c ? c.id : null;
  },
  async _getFuncId(usuario_id) {
    const f = await Funcionario.findOne({ where: { usuario_id } });
    return f ? f.id : null;
  },

  ////////////////////////////////////////////
  // 1. FAZER AGENDAMENTO
  ////////////////////////////////////////////
  async fazer_agendamento(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id: usuario_id } = req.user; 
      const { servico_id, funcionario_id, data_hora_inicio } = req.body;

      const c_id = await agendamento_Controller._getClienteId(usuario_id);
      if (!c_id) return res.status(404).json({ erro: "Perfil de cliente não encontrado." });

      const inicio = new Date(data_hora_inicio);
      if (inicio <= new Date()) return res.status(400).json({ erro: "Não é possível agendar no passado." });

      // 1. Buscar duração e calcular fim
      const servico = await Servico.findByPk(servico_id);
      if (!servico) return res.status(404).json({ erro: "Serviço não encontrado." });
      const fim = new Date(inicio.getTime() + servico.duracao_minutos * 60000);

      // 2. Verificar escala do funcionário (agenda_funcionario)
      const diaSemana = inicio.getDay();
      const horaSimples = inicio.toTimeString().slice(0, 8);
      const escala = await AgendaFuncionario.findOne({
        where: {
          funcionario_id, dia_semana: diaSemana, disponivel: true,
          hora_inicio: { [Op.lte]: horaSimples },
          hora_fim: { [Op.gte]: horaSimples }
        }
      });
      if (!escala) return res.status(400).json({ erro: "Profissional não atende neste horário." });

      // 3. Verificar conflitos de horário (Overlap)
      const statusCancelado = await StatusAgendamento.findOne({ where: { nome: 'cancelado' } });
      const conflito = await Agendamento.findOne({
        where: {
          funcionario_id,
          status_id: { [Op.ne]: statusCancelado.id },
          [Op.or]: [
            { data_hora_inicio: { [Op.between]: [inicio, fim] } },
            { data_hora_fim: { [Op.between]: [inicio, fim] } }
          ]
        }
      });
      if (conflito) return res.status(409).json({ erro: "Horário já ocupado." });

      // 4. Criar
      const statusPendente = await StatusAgendamento.findOne({ where: { nome: 'pendente' } });
      const novo = await Agendamento.create({
        cliente_id: c_id,
        servico_id,
        funcionario_id,
        status_id: statusPendente.id,
        data_hora_inicio: inicio,
        data_hora_fim: fim
      }, { transaction: t });

      await t.commit();
      return res.status(201).json(novo);
    } catch (erro) {
      await t.rollback();
      return res.status(500).json({ erro: "Erro ao processar agendamento." });
    }
  },

  ////////////////////////////////////////////
  // 2. CONFIRMAR AGENDAMENTO (Uso do Admin ou Funcionario)
  ////////////////////////////////////////////
  async confirmar(req, res) {
    try {
      const { id } = req.params;
      const statusConfirmado = await StatusAgendamento.findOne({ where: { nome: 'confirmado' } });
      
      await Agendamento.update(
        { status_id: statusConfirmado.id },
        { where: { id } }
      );
      return res.json({ mensagem: "Confirmado com sucesso." });
    } catch (e) { return res.status(500).json({ erro: "Erro ao confirmar." }); }
  },

  ////////////////////////////////////////////
  // 3. CANCELAR (Com Regra das 72h)
  ////////////////////////////////////////////
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const { id: usuario_id, usuario_tipo } = req.user;

      const agendamento = await Agendamento.findByPk(id);
      if (!agendamento) return res.status(404).json({ erro: "Não encontrado." });

      // Regra das 72h apenas para CLIENTES
      if (usuario_tipo === 'cliente') {
        const c_id = await agendamento_Controller._getClienteId(usuario_id);
        if (agendamento.cliente_id !== c_id) return res.status(403).json({ erro: "Acesso negado." });

        const agora = new Date();
        const inicioServico = new Date(agendamento.data_hora_inicio);
        const limite72h = 72 * 60 * 60 * 1000;

        if (inicioServico - agora < limite72h) {
          return res.status(400).json({ erro: "Cancelamento só permitido com 72h de antecedência. Contacte o suporte." });
        }
      }

      const statusCancelado = await StatusAgendamento.findOne({ where: { nome: 'cancelado' } });
      await agendamento.update({ status_id: statusCancelado.id });

      return res.json({ mensagem: "Cancelado com sucesso." });
    } catch (e) { return res.status(500).json({ erro: "Erro ao cancelar." }); }
  },

  ////////////////////////////////////////////
  // 4. REAGENDAR (Com Regra das 72h)
  ////////////////////////////////////////////
  async reagendar(req, res) {
    try {
      const { id } = req.params;
      const { nova_data_hora } = req.body;
      const { id: usuario_id, usuario_tipo } = req.user;

      const agendamento = await Agendamento.findByPk(id, { include: [Servico] });
      if (!agendamento) return res.status(404).json({ erro: "Não encontrado." });

      // Validação 72h para cliente
      if (usuario_tipo === 'cliente') {
        const agora = new Date();
        const inicioAtual = new Date(agendamento.data_hora_inicio);
        if (inicioAtual - agora < 72 * 60 * 60 * 1000) {
          return res.status(400).json({ erro: "Reagendamento bloqueado pela regra das 72h." });
        }
      }

      const novo_inicio = new Date(nova_data_hora);
      const novo_fim = new Date(novo_inicio.getTime() + agendamento.Servico.duracao_minutos * 60000);

      // Verificar conflito no novo horário (exceto o próprio agendamento)
      const statusCancelado = await StatusAgendamento.findOne({ where: { nome: 'cancelado' } });
      const conflito = await Agendamento.findOne({
        where: {
          id: { [Op.ne]: id },
          funcionario_id: agendamento.funcionario_id,
          status_id: { [Op.ne]: statusCancelado.id },
          [Op.or]: [
            { data_hora_inicio: { [Op.between]: [novo_inicio, novo_fim] } },
            { data_hora_fim: { [Op.between]: [novo_inicio, novo_fim] } }
          ]
        }
      });

      if (conflito) return res.status(409).json({ erro: "Novo horário indisponível." });

      const statusReagendado = await StatusAgendamento.findOne({ where: { nome: 'reagendado' } });
      await agendamento.update({
        data_hora_inicio: novo_inicio,
        data_hora_fim: novo_fim,
        status_id: statusReagendado.id
      });

      return res.json({ mensagem: "Reagendado com sucesso." });
    } catch (e) { return res.status(500).json({ erro: "Erro ao reagendar." }); }
  },

  ////////////////////////////////////////////
  // 5. LISTAR AGENDAMENTOS (Dinâmico por Perfil)
  ////////////////////////////////////////////
  async listar_agendamentos(req, res) {
    try {
      const { id: usuario_id, usuario_tipo } = req.user;
      let filtro = {};

      if (usuario_tipo === 'cliente') {
        const c_id = await agendamento_Controller._getClienteId(usuario_id);
        filtro.cliente_id = c_id;
      } else if (usuario_tipo === 'funcionario') {
        const f_id = await agendamento_Controller._getFuncId(usuario_id);
        filtro.funcionario_id = f_id;
      }

      const lista = await Agendamento.findAll({
        where: filtro,
        include: [
          { model: Cliente, include: [{ model: Usuario, attributes: ['nome'] }] },
          { model: Funcionario, include: [{ model: Usuario, attributes: ['nome'] }] },
          { model: Servico },
          { model: StatusAgendamento }
        ],
        order: [['data_hora_inicio', 'ASC']]
      });

      return res.json(lista);
    } catch (e) { return res.status(500).json({ erro: "Erro ao listar." }); }
  }
};

export default agendamento_Controller;