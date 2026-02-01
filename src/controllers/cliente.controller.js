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
    const { data, funcionario_id, servico_id } = req.query;
    if (!data || !funcionario_id || !servico_id) {
      return res.status(400).json({ erro: "Dados incompletos para consulta." });
    }

    // 1. Descobrir o dia da semana (0-6)
    const dataAlvo = new Date(`${data}T00:00:00`);
    const diaSemana = dataAlvo.getDay(); 

    // 2. Buscar a escala do profissional
    const escala = await AgendaFuncionario.findOne({
      where: { funcionario_id, dia_semana: diaSemana, disponivel: true }
    });

    if (!escala) return res.json([]);

    // 3. Buscar agendamentos e bloqueios
    const ocupados = await Agendamento.findAll({
      where: {
        funcionario_id,
        status_id: { [Op.ne]: 3 }, // Diferente de cancelado
        data_hora_inicio: { [Op.between]: [`${data} 00:00:00`, `${data} 23:59:59`] }
      }
    });

    const servico = await Servico.findByPk(servico_id);
    const duracaoMinutos = servico ? servico.duracao_minutos : 60;

    // 4. Gerar slots baseados na escala do banco
    let horariosLivres = [];
    let ponteiroTempo = new Date(`${data}T${escala.hora_inicio}`);
    let fimExpediente = new Date(`${data}T${escala.hora_fim}`);

    while (ponteiroTempo < fimExpediente) {
      // DEFINIÇÃO DAS VARIÁVEIS DO SLOT (Importante para evitar o ReferenceError)
      const slotInicio = new Date(ponteiroTempo);
      const slotFim = new Date(slotInicio.getTime() + duracaoMinutos * 60000);

      // VERIFICAÇÃO DE CONFLITO
      const estaOcupado = ocupados.some(ag => {
        const agInicio = new Date(ag.data_hora_inicio).getTime();
        const agFim = new Date(ag.data_hora_fim).getTime();
        const sInicio = slotInicio.getTime();
        const sFim = slotFim.getTime();

        // Regra de colisão de horários
        return (sInicio < agFim && sFim > agInicio);
      });

      // Só adiciona se o horário for no futuro
      const agora = new Date();
      if (!estaOcupado && slotFim <= fimExpediente && slotInicio > agora) {
        horariosLivres.push(slotInicio.toTimeString().slice(0, 5));
      }

      // Avança 30 minutos para a próxima verificação
      ponteiroTempo.setMinutes(ponteiroTempo.getMinutes() + 30);
    }

    return res.json(horariosLivres);
  } catch (e) {
    console.error("ERRO AO CALCULAR HORÁRIOS:", e.message);
    return res.status(500).json({ erro: "Erro interno ao calcular agenda.", detalhe: e.message });
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
// Adicionar antes do update
if (new Date(agendamento.data_hora_fim) > new Date()) {
  return res.status(400).json({ erro: "Você só pode dar feedback após a conclusão do serviço." });
}
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
  },


// cliente.controller.js
 // No seu backend: cliente.controller.js
// cliente.controller.js
async listar_servicos_disponiveis(req, res) {
  try {
    const servicos = await Servico.findAll({
      // Mandamos o Sequelize incluir os profissionais vinculados
      include: [{
        model: Funcionario,
        // Como o nome está na tabela Usuario, incluímos ela também
        include: [{ 
          model: Usuario, 
          attributes: ['nome'] // Queremos apenas o nome
        }]
      }]
    });

    console.log("Serviços encontrados:", JSON.stringify(servicos, null, 2));
    return res.json(servicos);
  } catch (e) {
    console.error("Erro na API de serviços:", e);
    return res.status(500).json({ erro: "Erro ao buscar serviços." });
  }
}








};



export default cliente_Controller;