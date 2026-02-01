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
  AuditoriaLog
} from "../models/index.js";
import { normalizarAgenda } from "../utils/agendamento.utils.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const funcionario_Controller = {
  // Auxiliar para pegar o ID da tabela Funcionario
  async _getFuncionarioId(usuario_id) {
    const f = await Funcionario.findOne({ where: { usuario_id } });
    return f ? f.id : null;
  },

  // 1. Agenda Atual e Futura (Usada na Home e Agenda)
  // Localização: controllers/funcionario.controller.js

  async  ver_minha_agenda(req, res) {
  try {
    const { id: usuario_id } = req.user;
    const { data } = req.query;

    const funcionarioLogado = await Funcionario.findOne({
      where: { usuario_id },
    });

    let whereClause = {};

    // 🔹 DATA/HORA no fuso de Cabo Verde
    const agora = dayjs().tz("Atlantic/Cape_Verde");

    if (data && data.trim() !== "") {
      const dataEscolhida = dayjs(data).tz("Atlantic/Cape_Verde");
      whereClause.data_hora_inicio = {
        [Op.gte]: dataEscolhida.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        [Op.lte]: dataEscolhida.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      };
    } else {
      const trintaDiasAtras = agora.subtract(30, "day");
      whereClause.data_hora_inicio = {
        [Op.gte]: trintaDiasAtras.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      };
    }

    // 🎯 REGRA DE NEGÓCIO
    if (funcionarioLogado) {
      if (funcionarioLogado.tipo === "profissional") {
        whereClause.funcionario_id = funcionarioLogado.id;
        console.log("📌 Profissional: vendo apenas minha agenda");
      } else {
        console.log("📌 Recepcionista: vendo agenda geral");
      }
    }

    const agenda = await Agendamento.findAll({
      where: whereClause,
      include: [
        { model: Cliente, include: [{ model: Usuario, attributes: ["nome", "numero_telefone"] }] },
        { model: Servico, attributes: ["nome_servico", "duracao_minutos", "preco"] },
        { model: StatusAgendamento, attributes: ["nome"] },
        { model: Funcionario, attributes: ["id"], include: [{ model: Usuario, attributes: ["nome"] }] },
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
        status: dataJson.StatusAgendamento?.nome || "pendente",
        // Formatar data/hora para exibição no fuso CVE
        data_hora_inicio: dayjs(dataJson.data_hora_inicio).tz("Atlantic/Cape_Verde").format("YYYY-MM-DD HH:mm:ss"),
        data_hora_fim: dayjs(dataJson.data_hora_fim).tz("Atlantic/Cape_Verde").format("YYYY-MM-DD HH:mm:ss"),
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

   async get_disponibilidade(req, res) {
    try {
      const { funcionario_id } = req.params;
      const agenda = await AgendaFuncionario.findAll({
        where: { funcionario_id },
        order: [['dia_semana', 'ASC']]
      });
      return res.json(agenda);
    } catch (e) {
      return res.status(500).json({ erro: "Erro ao buscar disponibilidade." });
    }
  },
  async obter_panorama_completo(req, res) {
  const { funcionario_id } = req.params; // Correto: vem da URL

  try {
    // 1. Informação do Profissional
    const profissional = await Funcionario.findByPk(funcionario_id, {
      include: [{ model: Usuario, attributes: ['nome'] }]
    });

    if (!profissional) {
      return res.status(404).json({ erro: "Profissional não encontrado." });
    }

    // 2. Escala Semanal
    const escala = await AgendaFuncionario.findAll({
      where: { funcionario_id },
      order: [['dia_semana', 'ASC']]
    });

    // 3. Bloqueios (Agendamentos sem cliente e sem serviço)
    const bloqueios = await Agendamento.findAll({
      where: { 
        funcionario_id,
        cliente_id: null,
        data_hora_inicio: { [Op.gte]: dayjs().subtract(1, 'day').toDate() }
      },
      order: [['data_hora_inicio', 'ASC']]
    });

    // 4. Log de Auditoria (Corrigido req.user.id e a origem do ID do funcionário)
    await AuditoriaLog.create({
      usuario_id: req.user?.id || 1, // ID do administrador/rececionista logado
      descricao: "Visualização de Panorama",
      detalhes: `Consultou a agenda completa do funcionário: ${profissional.Usuario?.nome}`
    });

    // Retornamos o objeto exatamente como o seu Frontend espera
    return res.json({
      profissional: {
        nome: profissional.Usuario?.nome || "Sem Nome",
        ativo: profissional.ativo
      },
      escala: escala,
      bloqueios: bloqueios
    });

  } catch (e) {
    console.error("ERRO NO PANORAMA:", e);
    return res.status(500).json({ 
      erro: "Erro ao carregar panorama.",
      detalhes: e.message 
    });
  }
},
  // 2. Marcar Disponibilidade Semanal (POST)
  // No topo do teu arquivo, certifica-te que o pool está importado
// 

// 2. SALVAR AGENDA (SQL PURO - SEM SEQUELIZE)
async marcar_disponibilidade(req, res) {
  const { funcionario_id, semana } = req.body;

  if (!funcionario_id || !semana || !Array.isArray(semana)) {
    return res.status(400).json({ erro: "Dados da agenda inválidos ou incompletos." });
  }

  // Mapeamento exato para o que o seu frontend envia
  const mapaDias = {
    "Domingo": 0, "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3,
    "Quinta-feira": 4, "Sexta-feira": 5, "Sábado": 6
  };

  const t = await AgendaFuncionario.sequelize.transaction();

  try {
    // 1. Limpar a agenda anterior
    await AgendaFuncionario.destroy({
      where: { funcionario_id },
      transaction: t
    });

    // 2. Mapear e validar as novas entradas
    const novasEntradas = semana.map(item => {
      const diaNum = mapaDias[item.dia];
      
      // Validação de segurança: se o dia não for encontrado no mapa, lança erro
      if (diaNum === undefined) throw new Error(`Dia da semana inválido: ${item.dia}`);

      return {
        funcionario_id,
        dia_semana: diaNum,
        hora_inicio: item.entrada || "08:00",
        hora_fim: item.saida || "19:00",
        disponivel: !!item.ativo // Garante que é booleano
      };
    });

    // 3. Inserir no banco
    await AgendaFuncionario.bulkCreate(novasEntradas, { transaction: t });

    // 4. Gravar Auditoria (Agora com o modelo importado corretamente)
    // Usamos req.user.id (do middleware auth) ou req.body.admin_id como fallback
    const logAtor = req.user?.id || funcionario_id; 

    await AuditoriaLog.create({
      usuario_id: logAtor,
      descricao: "Agenda Atualizada",
      detalhes: `A disponibilidade do funcionário ID ${funcionario_id} foi reconfigurada.`
    }, { transaction: t });

    await t.commit();
    return res.json({ mensagem: "Agenda atualizada com sucesso! ✨" });

  } catch (erro) {
    if (t) await t.rollback();
    console.error("ERRO DETALHADO NO BANCO:", erro);
    
    // Retornamos o erro real para ajudar no debug se necessário
    return res.status(500).json({ 
      erro: "Erro ao salvar disponibilidade no banco.",
      detalhe: erro.message 
    });
  }
},

  // 3. Bloquear Horário (Cria um agendamento fake para bloquear aquele dia)
  // Bloquear Horário
async bloquear_horario(req, res) {
  const { data, hora, motivo, funcionario_id } = req.body;

  try {
    // Trim remove espaços em branco acidentais
    const data_formatada = data.trim();
    const hora_formatada = hora.trim();
    const data_hora_inicio = `${data_formatada} ${hora_formatada}`;
    
    // Calcula o fim (bloqueio de 1 hora)
    const data_hora_fim = dayjs(data_hora_inicio).add(1, 'hour').format("YYYY-MM-DD HH:mm:ss");

    await Agendamento.create({
      funcionario_id: parseInt(funcionario_id),
      cliente_id: null,
      servico_id: null,
      status_id: 2, 
      data_hora_inicio: data_hora_inicio,
      data_hora_fim: data_hora_fim,
      feedback_comentario: motivo || "Bloqueio Manual"
    });

    await AuditoriaLog.create({
      usuario_id: req.user?.id || 1,
      descricao: "Horário Bloqueado",
      detalhes: `Bloqueio manual para o funcionário ${funcionario_id} às ${data_hora_inicio}`
    });

    return res.json({ mensagem: "Horário bloqueado com sucesso! 🔒" });

  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        erro: "Este horário já está ocupado por outro agendamento ou bloqueio." 
      });
    }
    console.error("ERRO AO BLOQUEAR:", e);
    return res.status(500).json({ erro: "Erro interno ao processar o bloqueio." });
  }
},
// Marcar Férias (Desativa o funcionário temporariamente)
async marcar_ferias(req, res) {
  const { funcionario_id, data_inicio, data_fim } = req.body;

  try {
    let dataAtual = dayjs(data_inicio);
    const fim = dayjs(data_fim);

    while (dataAtual.isBefore(fim) || dataAtual.isSame(fim, 'day')) {
      const dataStr = dataAtual.format("YYYY-MM-DD");

      await Agendamento.create({
        funcionario_id: parseInt(funcionario_id),
        cliente_id: null,
        servico_id: null,
        status_id: 2, 
        // BLOQUEIO TOTAL: das 00:00 às 23:59 para não sobrar nenhum minuto livre
        data_hora_inicio: `${dataStr} 00:00:00`,
        data_hora_fim: `${dataStr} 23:59:59`,
        feedback_comentario: "Férias / Ausência"
      }).catch(err => console.log(`Dia ${dataStr} já estava bloqueado.`));

      dataAtual = dataAtual.add(1, 'day');
    }

    return res.json({ mensagem: "Férias registradas! Todos os horários do período foram bloqueados. ✈️" });
  } catch (e) {
    return res.status(500).json({ erro: "Erro ao registrar férias." });
  }
},

  // Helper para pegar ID do funcionário a partir do Usuário logado
  async _getFuncionarioId(usuario_id) {
    const f = await Funcionario.findOne({ where: { usuario_id } });
    return f ? f.id : null;
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

  // Lista todos os serviços ativos
  async listarServicos(req, res) {
    try {
      const servicos = await Servico.findAll({ where: { ativo: true } });
      return res.json(servicos);
    } catch (e) {
      return res.status(500).json({ erro: "Erro ao buscar serviços" });
    }
  },

  // Lista apenas funcionários que são 'profissionais' (quem atende)
  // No topo do seu arquivo, certifique-se de que tem estas importações:
// import { Funcionario, Usuario } from "../models/index.js";

async listarProfissionais(req, res) {
  try {
    // Usamos o Sequelize para buscar os dados com o JOIN automático
    const profissionais = await Funcionario.findAll({
      include: [
        {
          model: Usuario,
          attributes: ["nome"], // Pegamos apenas o nome da tabela Usuario
        },
      ],
    });

    // Formatamos os dados para o formato que o seu Frontend espera {id, nome}
    const formatados = profissionais.map((p) => ({
      id: p.id,
      nome: p.Usuario ? p.Usuario.nome : "Sem Nome",
    }));

    console.log("=== PROFISSIONAIS ENCONTRADOS (SEQUELIZE) ===");
    console.log(formatados);

    return res.json(formatados);
  } catch (erro) {
    console.error("ERRO AO LISTAR PROFISSIONAIS:", erro);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
},

  // Lista todos os clientes para a recepcionista escolher
  async listarClientes(req, res) {
    try {
      const clientes = await Cliente.findAll({
        include: [{ model: Usuario, attributes: ['nome', 'numero_telefone'] }]
      });

      const resultado = clientes.map(c => ({
        id: c.id,
        nome: c.Usuario?.nome || "Cliente",
        numero_telefone: c.Usuario?.numero_telefone || ""
      }));

      return res.json(resultado);
    } catch (e) {
      return res.status(500).json({ erro: "Erro ao buscar clientes" });
    }
  }













};

export default funcionario_Controller;
