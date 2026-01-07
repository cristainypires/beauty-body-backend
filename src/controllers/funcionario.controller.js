import{ Op } from "sequelize";
import db from "../database/index.js";
const { Agendamento, Cliente, Servico, AgendaFuncionario } = db;
const funcionario_Controller = {



  ////////////////////////////////////////////
  // 1. VER MINHA AGENDA DO DIA /////////////
  ////////////////////////////////////////////
  async ver_minha_agenda(req, res) {
    try {
      const { usuario_id } = req.user; 
      const { data } = req.query; 

      if (!data) {
        return res.status(400).json({ erro: "Por favor, informe a data." });
      }

      const agenda = await Agendamento.findAll({
        where: {
          funcionario_id: usuario_id,
          data_hora_inicio: {
            [Op.between]: [
              new Date(`${data}T00:00:00`), 
              new Date(`${data}T23:59:59`)
            ]
          },
          status: { [Op.ne]: 'cancelado' } // Não mostra cancelados na agenda ativa
        },
        include: [
          { 
            model: Cliente, 
            attributes: ['nome', 'numero_telefone'] // Detalhes do cliente para contato
          },
          { 
            model: Servico, 
            attributes: ['nome_servico', 'duracao_minutos'] 
          }
        ],
        order: [['data_hora_inicio', 'ASC']]
      });

      return res.json(agenda);
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar sua agenda." });
    }
  },




  ////////////////////////////////////////////////////////
  // 2. CONCLUIR SERVIÇO  ////////////
  ////////////////////////////////////////////////////////
  async concluir_servico(req, res) {
    try {
      const { agendamento_id } = req.params;
      const { usuario_id } = req.user;

      const agendamento = await Agendamento.findByPk(agendamento_id);

      // Validação: Só o próprio funcionário pode concluir seu serviço
      if (!agendamento || agendamento.funcionario_id !== usuario_id) {
        return res.status(403).json({ erro: "Acesso negado ou registro não encontrado." });
      }

      if (agendamento.status !== 'confirmado' && agendamento.status !== 'pendente') {
        return res.status(400).json({ erro: "Apenas serviços agendados podem ser concluídos." });
      }

      await agendamento.update({
        status: 'concluido',
        atualizado_em: new Date()
      });

      return res.json({ mensagem: "Serviço finalizado com sucesso!" });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao concluir o serviço." });
    }
  },



  ////////////////////////////////////////////
  // 3. DEFINIR DISPONIBILIDADE SEMANAL ////////
  ////////////////////////////////////////////
  async marcar_disponibilidade(req, res) {
    try {
      const { usuario_id } = req.user;
      const { dia_semana, hora_inicio, hora_fim, disponivel } = req.body;

      // dia_semana: 0 (Dom) a 6 (Sab)
      if (dia_semana < 0 || dia_semana > 6) {
        return res.status(400).json({ erro: "Dia da semana inválido." });
      }

      // Procura se já existe configuração para este dia, se sim atualiza, se não cria
      const [agenda, created] = await AgendaFuncionario.findOrCreate({
        where: { funcionario_id: usuario_id, dia_semana },
        defaults: { hora_inicio, hora_fim, disponivel }
      });

      if (!created) {
        await agenda.update({ hora_inicio, hora_fim, disponivel });
      }

      return res.json({ mensagem: "Sua disponibilidade semanal foi atualizada." });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao salvar disponibilidade." });
    }
  },




  ////////////////////////////////////////////
  // 4. BLOQUEAR HORÁRIO //////////////////
  ////////////////////////////////////////////
  async bloquear_horario(req, res) {
    try {
      const { usuario_id } = req.user;
      const { data, hora_inicio, hora_fim, motivo } = req.body;

      // Cria um agendamento com status 'bloqueado' para impedir que clientes marquem
      await Agendamento.create({
        funcionario_id: usuario_id,
        cliente_id: null, // Sem cliente vinculado
        servico_id: null,
        data_hora_inicio: new Date(`${data}T${hora_inicio}`),
        data_hora_fim: new Date(`${data}T${hora_fim}`),
        status: 'bloqueado',
        observacoes_funcionario: motivo || "Bloqueio de agenda manual"
      });

      return res.json({ mensagem: "Horário bloqueado com sucesso." });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao realizar bloqueio." });
    }
  },




  ////////////////////////////////////////////
  // 5. VER MEU HISTÓRICO DE SERVIÇOS
  ////////////////////////////////////////////
  async ver_historico_pessoal(req, res) {
    try {
      const { usuario_id } = req.user;

      const historico = await Agendamento.findAll({
        where: { funcionario_id: usuario_id, status: 'concluido' },
        include: [
            { model: Servico, attributes: ['nome_servico'] },
            { model: Cliente, attributes: ['nome'] }
        ],
        order: [['data_hora_inicio', 'DESC']]
      });

      return res.json({ 
        total_servicos_realizados: historico.length,
        historico 
      });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar seu histórico." });
    }
  }
};
export default funcionario_Controller;