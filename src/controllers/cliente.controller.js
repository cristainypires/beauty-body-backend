const { Op } = require("sequelize");
const {Agendamento,Servico,Funcionario,AgendaFuncionario} = require("../database");

const cliente_Controller = {




  ////////////////////////////////////////////
  // 1. LISTAR SERVIÇOS ATIVOS
  ////////////////////////////////////////////
  async listar_servicos_disponiveis(req, res) {
    try {
      const servicos = await Servico.findAll({
        where: { ativo: true },
        attributes: ["id", "nome_servico", "duracao_minutos", "preco"],
      });

      return res.json(servicos);
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar serviços." });
    }
  },





  ////////////////////////////////////////////
  // 2. LISTAR PROFISSIONAIS POR SERVIÇO
  ////////////////////////////////////////////
  async listar_profissionais_por_servico(req, res) {
    try {
      const { servico_id } = req.params;

      if (!servico_id) {
        return res.status(400).json({ erro: "Serviço não informado." });
      }

      const profissionais = await Funcionario.findAll({
        where: { ativo: true },
        attributes: ["id", "nome"],
        include: [
          {
            model: Servico,
            attributes: [],
            where: { id: servico_id },
            through: { where: { habilitado: true } },
          },
        ],
      });

      if (!profissionais.length) {
        return res.json({
          mensagem: "Nenhum profissional disponível para este serviço.",
          profissionais: [],
        });
      }

      return res.json(profissionais);
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar profissionais." });
    }
  },






  ////////////////////////////////////////////
  // 3. VER MEUS AGENDAMENTOS (HISTÓRICO)
  ////////////////////////////////////////////
  async listar_agendamentos(req, res) {
    try {
      const { usuario_id } = req.user;

      const agendamentos = await Agendamento.findAll({
        where: { cliente_id: usuario_id },
        include: [
          { model: Servico, attributes: ["nome_servico"] },
          { model: Funcionario, attributes: ["nome"] },
        ],
        order: [["data_hora_inicio", "DESC"]],
      });

      return res.json(agendamentos);
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar seu histórico." });
    }
  },




  ////////////////////////////////////////////
  // 4. FEEDBACK DE SERVIÇO
  ////////////////////////////////////////////
  async feedback_servico(req, res) {
    try {
      const { agendamento_id } = req.params;
      const { nota, comentario } = req.body;
      const { usuario_id } = req.user;

      if (!nota || nota < 0 || nota > 10) {
        return res.status(400).json({ erro: "A nota deve ser entre 0 e 10." });
      }

      const agendamento = await Agendamento.findByPk(agendamento_id);

      if (!agendamento || agendamento.cliente_id !== usuario_id) {
        return res
          .status(403)
          .json({ erro: "Agendamento não encontrado ou acesso negado." });
      }

      if (agendamento.status !== "concluido") {
        return res
          .status(400)
          .json({ erro: "Só é possível avaliar serviços concluídos." });
      }

      if (agendamento.feedback_nota !== null) {
        return res
          .status(400)
          .json({ erro: "Este serviço já foi avaliado." });
      }

      await agendamento.update({
        feedback_nota: nota,
        feedback_comentario: comentario || null,
      });

      return res.json({ mensagem: "Feedback registado com sucesso." });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao processar feedback." });
    }
  },




  ////////////////////////////////////////////
  // 5. CONSULTAR HORÁRIOS LIVRES
  ////////////////////////////////////////////
  async consultar_horarios_livres(req, res) {
    try {
      const { funcionario_id, servico_id, data } = req.query;

      // Validação inicial
      if (!funcionario_id || !servico_id || !data) {
        return res
          .status(400)
          .json({ erro: "funcionario_id, servico_id e data são obrigatórios." });
      }

      const funcionario = await Funcionario.findByPk(funcionario_id);
      if (!funcionario || !funcionario.ativo) {
        return res.status(404).json({ erro: "Profissional inválido." });
      }

      const servico = await Servico.findByPk(servico_id);
      if (!servico) {
        return res.status(404).json({ erro: "Serviço inválido." });
      }

      // Descobrir dia da semana
      const diaSemana = new Date(data).getDay();

      const jornada = await AgendaFuncionario.findOne({
        where: {
          funcionario_id,
          dia_semana: diaSemana,
          disponivel: true,
        },
      });

      if (!jornada) {
        return res.json({
          mensagem: "O profissional não trabalha neste dia.",
          horarios_livres: [],
        });
      }

      // Agendamentos existentes no dia
      const ocupados = await Agendamento.findAll({
        where: {
          funcionario_id,
          data_hora_inicio: {
            [Op.between]: [
              new Date(`${data}T00:00:00`),
              new Date(`${data}T23:59:59`),
            ],
          },
          status: { [Op.notIn]: ["cancelado", "expirado"] },
        },
        attributes: ["data_hora_inicio", "data_hora_fim"],
      });

      // Gerar horários
      const horariosDisponiveis = [];
      let inicio = new Date(`${data}T${jornada.hora_inicio}`);
      const fimJornada = new Date(`${data}T${jornada.hora_fim}`);

      while (inicio < fimJornada) {
        const fimEstimado = new Date(
          inicio.getTime() + servico.duracao_minutos * 60000
        );

        const conflito = ocupados.some((ag) => {
          const agInicio = new Date(ag.data_hora_inicio);
          const agFim = new Date(ag.data_hora_fim);
          return inicio < agFim && fimEstimado > agInicio;
        });

        if (!conflito && fimEstimado <= fimJornada) {
          horariosDisponiveis.push(inicio.toTimeString().slice(0, 5));
        }

        inicio.setMinutes(inicio.getMinutes() + 30);
      }

      return res.json({
        data,
        funcionario_id,
        servico: servico.nome_servico,
        horarios_livres: horariosDisponiveis,
      });
    } catch (erro) {
      console.error(erro);
      return res
        .status(500)
        .json({ erro: "Erro ao calcular horários livres." });
    }
  },
};

module.exports = cliente_Controller;
