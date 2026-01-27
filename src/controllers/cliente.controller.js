import { Op } from "sequelize";
import { 
  Agendamento, 
  Servico, 
  Funcionario, 
  Usuario, 
  Cliente, 
  AgendaFuncionario, 
  StatusAgendamento 
} from "../models/index.js";

const cliente_Controller = {

  ////////////////////////////////////////////////////////
  // AUXILIAR: BUSCAR ID DO CLIENTE PELO USUARIO_ID
  ////////////////////////////////////////////////////////
  async _getClienteId(usuario_id) {
    const c = await Cliente.findOne({ where: { usuario_id } });
    return c ? c.id : null;
  },

  ////////////////////////////////////////////
  // 1. LISTAR SERVIÇOS ATIVOS
  ////////////////////////////////////////////
  async listar_servicos_disponiveis(req, res) {
    try {
      const servicos = await Servico.findAll({
        where: { ativo: true },
        attributes: ["id", "nome_servico", "duracao_minutos", "preco"],
        order: [["nome_servico", "ASC"]]
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

      const profissionais = await Funcionario.findAll({
        where: { ativo: true },
        include: [
          {
            model: Usuario,
            attributes: ["nome", "apelido", "email"]
          },
          {
            model: Servico,
            where: { id: servico_id },
            attributes: [],
            through: { attributes: [] } // Referente à tabela servico_funcionario
          }
        ]
      });

      return res.json(profissionais);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar profissionais para este serviço." });
    }
  },

  ////////////////////////////////////////////
  // 3. VER MEUS AGENDAMENTOS (HISTÓRICO)
  ////////////////////////////////////////////
  async listar_agendamentos(req, res) {
    try {
      const { id: usuario_id } = req.user;
      const cliente_id = await cliente_Controller._getClienteId(usuario_id);

      if (!cliente_id) return res.status(404).json({ erro: "Cliente não encontrado." });

      const agendamentos = await Agendamento.findAll({
        where: { cliente_id },
        include: [
          { model: Servico, attributes: ["nome_servico", "preco", "duracao_minutos"] },
          { 
            model: Funcionario, 
            include: [{ model: Usuario, attributes: ["nome"] }] 
          },
          { model: StatusAgendamento, attributes: ["nome"] }
        ],
        order: [["data_hora_inicio", "DESC"]],
      });

      return res.json(agendamentos);
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar seu histórico de agendamentos." });
    }
  },

  ////////////////////////////////////////////
  // 4. CONSULTAR HORÁRIOS LIVRES
  ////////////////////////////////////////////
  async consultar_horarios_livres(req, res) {
    try {
      const { funcionario_id, servico_id, data } = req.query;

      if (!funcionario_id || !servico_id || !data) {
        return res.status(400).json({ erro: "Parâmetros insuficientes." });
      }

      const servico = await Servico.findByPk(servico_id);
      if (!servico) return res.status(404).json({ erro: "Serviço não encontrado." });

      // Pegar dia da semana (0-6)
      const dataObj = new Date(data);
      const diaSemana = dataObj.getUTCDay(); 

      // 1. Checar se o funcionário atende nesse dia (tabela agenda_funcionario)
      const jornada = await AgendaFuncionario.findOne({
        where: { funcionario_id, dia_semana: diaSemana, disponivel: true }
      });

      if (!jornada) {
        return res.json({ mensagem: "Profissional não atende nesta data.", horarios_livres: [] });
      }

      // 2. Buscar agendamentos existentes (Ignorando os cancelados)
      const statusCancelado = await StatusAgendamento.findOne({ where: { nome: 'cancelado' } });
      const ocupados = await Agendamento.findAll({
        where: {
          funcionario_id,
          status_id: { [Op.ne]: statusCancelado.id },
          data_hora_inicio: {
            [Op.between]: [
              new Date(`${data}T00:00:00Z`),
              new Date(`${data}T23:59:59Z`)
            ]
          }
        }
      });

      // 3. Gerar os slots de tempo
      const horariosDisponiveis = [];
      let atual = new Date(`${data}T${jornada.hora_inicio}Z`);
      const fimJornada = new Date(`${data}T${jornada.hora_fim}Z`);

      while (atual < fimJornada) {
        const slotFim = new Date(atual.getTime() + servico.duracao_minutos * 60000);

        // Verifica se o slot de agora colide com algum agendamento do banco
        const colisao = ocupados.some(ag => {
          const agInicio = new Date(ag.data_hora_inicio);
          const agFim = new Date(ag.data_hora_fim);
          return (atual < agFim && slotFim > agInicio);
        });

        if (!colisao && slotFim <= fimJornada) {
          horariosDisponiveis.push(atual.toISOString().slice(11, 16)); // Retorna "HH:MM"
        }

        atual.setMinutes(atual.getMinutes() + 30); // Pula de 30 em 30 min para oferecer opções
      }

      return res.json({ data, horarios_livres: horariosDisponiveis });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao calcular horários livres." });
    }
  },

  ////////////////////////////////////////////
  // 5. FEEDBACK DE SERVIÇO
  ////////////////////////////////////////////
  async feedback_servico(req, res) {
    try {
      const { agendamento_id } = req.params;
      const { nota, comentario } = req.body;
      const { id: usuario_id } = req.user;

      const cliente_id = await cliente_Controller._getClienteId(usuario_id);
      
      const agendamento = await Agendamento.findOne({
        where: { id: agendamento_id, cliente_id }
      });

      if (!agendamento) return res.status(404).json({ erro: "Agendamento não encontrado." });

      // Verificação de segurança: Se as colunas não existirem no SQL, isso vai falhar.
      // Você deve rodar: ALTER TABLE agendamento ADD COLUMN feedback_nota INT, ADD COLUMN feedback_comentario TEXT;
      await agendamento.update({
        feedback_nota: nota,
        feedback_comentario: comentario
      });

      return res.json({ mensagem: "Obrigado pela sua avaliação!" });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao processar feedback. Verifique se o sistema de notas está ativo." });
    }
  }
};

export default cliente_Controller;