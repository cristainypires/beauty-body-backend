import { Op } from "sequelize";
import pool from "../database/index.js";
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
  const { funcionario_id } = req.params;

  try {
    // 1. Informação do Profissional (Buscando o nome na tabela usuario com JOIN)
    const profResult = await pool.query(`
      SELECT f.id, u.nome, f.ativo 
      FROM funcionario f
      JOIN usuario u ON f.usuario_id = u.id
      WHERE f.id = $1
    `, [funcionario_id]);

    // 2. Escala Semanal (Confirmar se o nome é agenda_funcionario no singular)
    const escalaResult = await pool.query(`
      SELECT dia_semana, hora_inicio, hora_fim, disponivel 
      FROM agenda_funcionario 
      WHERE funcionario_id = $1 
      ORDER BY dia_semana ASC
    `, [funcionario_id]);

    // 3. Bloqueios (Confirmar se o nome é agendamento no singular)
    const bloqueiosResult = await pool.query(`
      SELECT data_hora_inicio, data_hora_fim, feedback_comentario as motivo 
      FROM agendamento 
      WHERE funcionario_id = $1 
      AND cliente_id IS NULL 
      AND data_hora_inicio >= NOW() - interval '1 day'
      ORDER BY data_hora_inicio ASC
    `, [funcionario_id]);


await AuditoriaLog.create({
      usuario_id: req.usuarioId, // ID do admin que está logado
      descricao: "Visualizacao de Agenda",
      detalhes: `O funcionario '${req.body.funcionario_id}' foi ver sua agenda.`
    });
    // Retornamos o objeto formatado para o front
    return res.json({
      profissional: profResult.rows[0] || { nome: "Não encontrado", ativo: false },
      escala: escalaResult.rows,
      bloqueios: bloqueiosResult.rows
    });

  } catch (e) {
    // IMPORTANTE: Vê o erro exato no terminal do VS Code agora
    console.error("ERRO NO PANORAMA:", e.message);
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

  if (!funcionario_id || !semana) {
    return res.status(400).json({ erro: "Dados incompletos." });
  }

  const mapaDias = {
    "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3,
    "Quinta-feira": 4, "Sexta-feira": 5, "Sábado": 6, "Domingo": 0
  };

  // Pegamos uma conexão do Pool
  const client = await pool.connect();

  try {
    // INICIAR TRANSAÇÃO MANUAL NO POSTGRES
    await client.query("BEGIN");

    // 1. Limpar a agenda anterior para evitar duplicados
    await client.query(
      "DELETE FROM agenda_funcionario WHERE funcionario_id = $1",
      [funcionario_id]
    );

    // 2. Inserir os novos horários
    for (const item of semana) {
      const diaEnum = mapaDias[item.dia];
      
      await client.query(
        `INSERT INTO agenda_funcionario 
          (funcionario_id, dia_semana, hora_inicio, hora_fim, disponivel) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          funcionario_id,
          diaEnum,
          item.entrada,
          item.saida,
          item.ativo
        ]
      );
    }

    // FINALIZAR TRANSAÇÃO (SALVAR)
    await client.query("COMMIT");
    await AuditoriaLog.create({
      usuario_id: req.usuarioId, // ID do admin que está logado
      descricao: "Marcação de Disponibilidade",
      detalhes: `O funcionario '${req.body.funcionario_id}' sua disponibilidade foi marcada.`
    });

    return res.json({ mensagem: "Agenda do profissional atualizada! ✅" });

    

  } catch (erro) {
    // SE DER ERRO, DESFAZ TUDO
    await client.query("ROLLBACK");
    console.error("Erro no SQL:", erro);
    return res.status(500).json({ erro: "Erro ao salvar disponibilidade no banco." });
  } finally {
    // LIBERAR CONEXÃO
    client.release();
  }
},

  // 3. Bloquear Horário (Cria um agendamento fake para bloquear aquele dia)
  // Bloquear Horário
async bloquear_horario(req, res) {
  const { data, hora, motivo, funcionario_id } = req.body;

  try {
    // 1. Montamos o início e o fim. 
    // Por padrão, bloqueamos 1 hora para imprevistos (podes ajustar conforme necessário)
    const data_hora_inicio = `${data} ${hora}`;

    // 2. Inserimos na tabela 'agendamento'
    // Deixamos cliente_id e servico_id como NULL para indicar que é um bloqueio
    await pool.query(
      `INSERT INTO agendamento 
        (funcionario_id, cliente_id, servico_id, status_id, data_hora_inicio, data_hora_fim, feedback_comentario, criado_em, atualizado_em) 
       VALUES ($1, NULL, NULL, $2, $3, $3::timestamp + interval '1 hour', $4, NOW(), NOW())`,
      [
        funcionario_id, 
        2, // Use o ID de status que representa "Confirmado" no seu banco (geralmente 2)
        data_hora_inicio,
        motivo || "Imprevisto / Bloqueio Manual"
      ]
    );
await AuditoriaLog.create({
      usuario_id: req.usuarioId, // ID do admin que está logado
      descricao: "Horario Bloqueado",
      detalhes: `O funcionario '${req.body.funcionario_id}' foi bloquear um Horario.`
    });
    return res.json({ mensagem: "Horário bloqueado com sucesso! Este período não aparecerá mais como disponível para os clientes. 🔒" });

  } catch (e) {
    console.error("ERRO AO BLOQUEAR:", e.message);
    return res.status(500).json({ 
      erro: "Erro ao bloquear.", 
      detalhes: e.message 
    });
  }
},

// Marcar Férias (Desativa o funcionário temporariamente)
async marcar_ferias(req, res) {
  const { funcionario_id, data_inicio, data_fim } = req.body;

  try {
    // 1. Alteramos para "funcionario" (singular)
    // 2. Opcional: Podes guardar as datas num campo de observações se quiseres
    await pool.query(
      "UPDATE funcionario SET ativo = false WHERE id = $1",
      [funcionario_id]
    );
await AuditoriaLog.create({
      usuario_id: req.usuarioId, // ID do admin que está logado
      descricao: "Marcação de ferias",
      detalhes: `O funcionario '${req.body.funcionario_id}' foi marcar sua feria para ${data_inicio} a ${data_fim}.`
    });
    return res.json({ 
      mensagem: `Férias registadas com sucesso de ${data_inicio} a ${data_fim}! O profissional está agora inativo.` 
    });

  } catch (e) {
    // Imprime o erro real no terminal para sabermos se é o nome da tabela ou da coluna
    console.error("ERRO NAS FÉRIAS:", e.message);
    
    return res.status(500).json({ 
      erro: "Erro ao registar férias.",
      detalhes: e.message 
    });
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
  async listarProfissionais(req, res) {
  try {
    // Fazemos um JOIN entre a tabela funcionario (f) e usuario (u)
    // Removemos o 'ativo: true' para que possas gerir mesmo quem está de férias
    const result = await pool.query(`
      SELECT f.id, u.nome 
      FROM funcionario f
      JOIN usuario u ON f.usuario_id = u.id
      WHERE f.tipo = 'profissional'
      ORDER BY u.nome ASC
    `);

    return res.json(result.rows);
  } catch (e) {
    console.error("Erro ao listar profissionais:", e.message);
    return res.status(500).json({ erro: "Erro ao buscar profissionais no banco." });
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
