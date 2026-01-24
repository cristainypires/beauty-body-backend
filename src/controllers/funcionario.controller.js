import { Op } from "sequelize";
import {
  Agendamento,
  Funcionario,
  Usuario,
  Cliente,
  Servico,
  StatusAgendamento,
  AgendaFuncionario,
  Pagamento,
} from "../models/index.js";
import { normalizarAgenda } from "../utils/agendamento.utils.js";

const funcionario_Controller = {
  // Auxiliar para pegar o ID da tabela Funcionario
  async _getFuncionarioId(usuario_id) {
    const f = await Funcionario.findOne({ where: { usuario_id } });
    return f ? f.id : null;
  },

  // 1. Agenda Atual e Futura (Usada na Home e Agenda)
  // Localização: controllers/funcionario.controller.js

  async ver_minha_agenda(req, res) {
  try {
    const { id: usuario_id } = req.user;
    const { data } = req.query;

    const funcionarioLogado = await Funcionario.findOne({
      where: { usuario_id },
    });

    // 🔒 Se não for funcionário, pode ser admin (ver tudo)
    let whereClause = {};

    // 📅 Lógica de datas
    const agora = new Date();
    if (data && data.trim() !== "") {
      whereClause.data_hora_inicio = {
        [Op.gte]: `${data} 00:00:00`,
        [Op.lte]: `${data} 23:59:59`,
      };
    } else {
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(agora.getDate() - 30);
      whereClause.data_hora_inicio = {
        [Op.gte]: `${trintaDiasAtras.toISOString().split("T")[0]} 00:00:00`,
      };
    }

    // 🎯 REGRA DE NEGÓCIO
    if (funcionarioLogado) {
      if (funcionarioLogado.tipo === "profissional") {
        // 👇 PROFISSIONAL: só vê a própria agenda
        whereClause.funcionario_id = funcionarioLogado.id;
        console.log("📌 Profissional: vendo apenas minha agenda");
      } else {
        // 👀 Recepcionista: vê tudo
        console.log("📌 Recepcionista: vendo agenda geral");
      }
    }

    const agenda = await Agendamento.findAll({
      where: whereClause,
      include: [
        {
          model: Cliente,
          include: [{ model: Usuario, attributes: ["nome", "numero_telefone"] }],
        },
        { model: Servico, attributes: ["nome_servico", "duracao_minutos", "preco"] },
        { model: StatusAgendamento, attributes: ["nome"] },
        {
          model: Funcionario,
          attributes: ["id"],
          include: [{ model: Usuario, attributes: ["nome"] }],
        },
      ],
      order: [["data_hora_inicio", "ASC"]],
    });

    const resultado = agenda.map((item) => {
      const dataJson = item.toJSON();
      return {
        ...dataJson,
        cliente_nome: dataJson.Cliente?.Usuario?.nome || "Cliente avulso",
        cliente_telefone: dataJson.Cliente?.Usuario?.numero_telefone || "",
        profissional_nome: dataJson.Funcionario?.Usuario?.nome || "Sem profissional",
      };
    });

    return res.json(normalizarAgenda(resultado));
  } catch (erro) {
    console.error("❌ ERRO:", erro);
    return res.status(500).json({ error: erro.message });
  }
},


  // 2. Histórico Pessoal
  async ver_historico_pessoal(req, res) {
    try {
      const { id: usuario_id } = req.user;
      const funcionario_id =
        await funcionario_Controller._getFuncionarioId(usuario_id);
      const agora = new Date();

      const historico = await Agendamento.findAll({
        where: { funcionario_id, data_hora_inicio: { [Op.lt]: agora } },
        include: [
          {
            model: Cliente,
            include: [
              { model: Usuario, attributes: ["nome", "numero_telefone"] },
            ],
          },
          { model: Servico, attributes: ["nome_servico", "preco"] },
          { model: StatusAgendamento, attributes: ["nome"] },
        ],
        order: [["data_hora_inicio", "DESC"]],
      });

      return res.json(normalizarAgenda(historico.map((i) => i.toJSON())));
    } catch (erro) {
      return res.status(500).json([]);
    }
  },

 

  // 4. Perfil Resumo (Necessário para a Sidebar/Header do Dash)
  async perfil_resumo(req, res) {
    try {
      const { id: usuario_id } = req.user;
      const dadosFunc = await Funcionario.findOne({
        where: { usuario_id },
        include: [
          {
            model: Usuario,
            attributes: ["nome", "apelido", "email", "numero_telefone"],
          },
        ],
      });

      if (!dadosFunc)
        return res.status(404).json({ erro: "Perfil não encontrado" });

      const totalServicos = await Agendamento.count({
        where: { funcionario_id: dadosFunc.id },
      });

      return res.json({
        id: dadosFunc.id,
        nome: dadosFunc.Usuario?.nome || "Funcionário",
        servico_associado: dadosFunc.funcao_especialidade || "Geral",
        avaliacao: 4.9,
        estatisticas: { total_agendamentos: totalServicos },
      });
    } catch (erro) {
      return res.status(500).send();
    }
  },

  // 5. Disponibilidade Semanal
  async marcar_disponibilidade(req, res) {
    try {
      const { id: usuario_id } = req.user;
      const { dia_semana, hora_inicio, hora_fim, disponivel } = req.body;
      const funcionario_id =
        await funcionario_Controller._getFuncionarioId(usuario_id);

      const [agenda, created] = await AgendaFuncionario.findOrCreate({
        where: { funcionario_id, dia_semana },
        defaults: { hora_inicio, hora_fim, disponivel },
      });

      if (!created) await agenda.update({ hora_inicio, hora_fim, disponivel });

      return res.json({ mensagem: "Disponibilidade atualizada." });
    } catch (erro) {
      return res.status(500).send();
    }
  },

  // 6. Bloquear Horário
  async bloquear_horario(req, res) {
    try {
      const { id: usuario_id } = req.user;
      const { data, hora_inicio, hora_fim } = req.body;
      const funcionario_id =
        await funcionario_Controller._getFuncionarioId(usuario_id);
      const statusCancelado = await StatusAgendamento.findOne({
        where: { nome: "cancelado" },
      });

      await Agendamento.create({
        funcionario_id,
        cliente_id: null,
        servico_id: null,
        status_id: statusCancelado.id,
        data_hora_inicio: new Date(`${data}T${hora_inicio}`),
        data_hora_fim: new Date(`${data}T${hora_fim}`),
      });

      return res.json({ mensagem: "Horário bloqueado com sucesso." });
    } catch (erro) {
      return res.status(500).send();
    }
  },

  // 7. Marcar Férias
  async marcar_ferias(req, res) {
    try {
      const { id: usuario_id } = req.user;
      const funcionario_id =
        await funcionario_Controller._getFuncionarioId(usuario_id);
      await Funcionario.update(
        { ativo: false },
        { where: { id: funcionario_id } },
      );
      return res.json({ mensagem: "Férias registradas!" });
    } catch (erro) {
      return res.status(500).send();
    }
  },

  // 8. Relatório Financeiro
  async relatorio_financeiro(req, res) {
    try {
      const { id: usuario_id } = req.user;
      const funcionario_id =
        await funcionario_Controller._getFuncionarioId(usuario_id);

      const agendamentos = await Agendamento.findAll({
        where: { funcionario_id },
        include: [{ model: Servico, attributes: ["preco"] }],
      });

      const total = agendamentos.reduce(
        (acc, ag) => acc + Number(ag.Servico?.preco || 0),
        0,
      );
      return res.json({ total, agendamentos });
    } catch (erro) {
      return res.status(500).send();
    }
  },




 async concluir_servico(req, res) {
    try {
      const { agendamento_id } = req.params;
      const status = await StatusAgendamento.findOne({
        where: { nome: "concluido" },
      });
      if (!status)
        return res
          .status(400)
          .json({ erro: "Status concluído não configurado." });

      await Agendamento.update(
        { status_id: status.id },
        { where: { id: agendamento_id } },
      );
      return res.json({ mensagem: "Serviço concluído com sucesso!" });
    } catch (e) {
      return res.status(500).json({ erro: "Erro ao concluir." });
    }
  },

















};

export default funcionario_Controller;
