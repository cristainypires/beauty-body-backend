import {
  Agendamento,
  Servico,
  Funcionario,
  Cliente,
  StatusAgendamento,
  AgendaFuncionario,
  Usuario,
} from "../models/index.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";
import bcryptjs from "bcryptjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const FUSO_CABO_VERDE = "Atlantic/Cape_Verde";
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
  // No seu agendamento.controller.js
  async fazer_agendamento(req, res) {
    const t = await sequelize.transaction();

    try {
      const {
        servico_id,
        funcionario_id,
        data_hora_inicio,
        cliente_id,
        novo_cliente_nome,
        novo_cliente_telefone,
        novo_cliente_email,
      } = req.body;

      let final_cliente_id = cliente_id;

      // --- 1. IDENTIFICAÇÃO DO CLIENTE (MUITO IMPORTANTE) ---

      // Caso a recepcionista tenha preenchido os campos de "Novo Cadastro"
      if (!final_cliente_id && novo_cliente_email) {
        // Verificamos se esse e-mail já existe no banco (ex: Marcelo Morais)
        let usuario = await Usuario.findOne({
          where: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("email")),
            novo_cliente_email.toLowerCase(),
          ),
        });

        if (!usuario) {
          // Se não existe, criamos o usuário novo
          const passwordHash = await bcryptjs.hash(novo_cliente_telefone, 10);
          usuario = await Usuario.create(
            {
              nome: novo_cliente_nome,
              apelido: novo_cliente_nome,
              email: novo_cliente_email,
              numero_telefone: novo_cliente_telefone,
              palavra_passe: passwordHash,
              usuario_tipo: "cliente",
            },
            { transaction: t },
          );
        }

        // Agora garantimos que esse usuário (novo ou antigo) tem um perfil na tabela 'cliente'
        let clientePerfil = await Cliente.findOne({
          where: { usuario_id: usuario.id },
        });

        if (!clientePerfil) {
          clientePerfil = await Cliente.create(
            {
              usuario_id: usuario.id,
              numero_telefone: novo_cliente_telefone || usuario.numero_telefone,
              nome: novo_cliente_nome || usuario.nome,
            },
            { transaction: t },
          );
        }

        final_cliente_id = clientePerfil.id;
      }
      // Caso seja o próprio cliente logado agendando para si mesmo
      else if (
        !final_cliente_id &&
        req.user &&
        req.user.usuario_tipo === "cliente"
      ) {
        final_cliente_id = await agendamento_Controller._getClienteId(
          req.user.id,
        );
      }

      if (!final_cliente_id) {
        await t.rollback();
        return res
          .status(400)
          .json({
            erro: "Por favor, selecione um cliente ou preencha o cadastro.",
          });
      }

      // --- 2. TRATAMENTO DE DATAS (Fuso Cabo Verde) ---
      const inicioCV = dayjs(data_hora_inicio).tz(FUSO_CABO_VERDE);
      const servico = await Servico.findByPk(servico_id);

      if (!servico) {
        await t.rollback();
        return res.status(404).json({ erro: "Serviço não encontrado." });
      }

      const fimCV = inicioCV.add(servico.duracao_minutos, "minute");
      const inicioDate = inicioCV.toDate();
      const fimDate = fimCV.toDate();

      // --- 3. VERIFICAÇÃO DE EXPEDIENTE ---
      // Se no seu banco Segunda=1, use .day(). Se Segunda=2, use .day() + 1
      const diaSemana = inicioCV.day();
      // No agendamento.controller.js
      const horaInicioStr = inicioCV.format("HH:mm");
      const horaFimStr = fimCV.format("HH:mm");

      const jornada = await AgendaFuncionario.findOne({
        where: {
          funcionario_id,
          dia_semana: diaSemana,
          disponivel: true,
          // Garantimos que a hora do banco (ex: 08:00) seja comparada corretamente
          hora_inicio: { [Op.lte]: horaInicioStr },
          hora_fim: { [Op.gte]: horaFimStr },
        },
        transaction: t,
      });

      if (!jornada) {
        await t.rollback();
        return res
          .status(400)
          .json({
            erro: `O profissional não atende neste horário (${horaInicioStr}h - Dia ${diaSemana}).`,
          });
      }

      // --- 4. VERIFICAÇÃO DE CONFLITO ---
      const statusCancelado = await StatusAgendamento.findOne({
        where: { nome: "cancelado" },
      });
      const conflito = await Agendamento.findOne({
        where: {
          funcionario_id,
          status_id: { [Op.ne]: statusCancelado ? statusCancelado.id : 0 },
          [Op.and]: [
            { data_hora_inicio: { [Op.lt]: fimDate } },
            { data_hora_fim: { [Op.gt]: inicioDate } },
          ],
        },
        transaction: t,
      });

      if (conflito) {
        await t.rollback();
        return res.status(409).json({ erro: "Este horário já está ocupado." });
      }

      // --- 5. CRIAÇÃO DO AGENDAMENTO ---
      const statusConfirmado = await StatusAgendamento.findOne({
        where: { nome: "confirmado" },
      });

      const novoAgendamento = await Agendamento.create(
        {
          cliente_id: final_cliente_id,
          servico_id,
          funcionario_id,
          status_id: statusConfirmado.id,
          data_hora_inicio: inicioDate,
          data_hora_fim: fimDate,
          valor_total: servico.preco,
        },
        { transaction: t },
      );

      await t.commit();
      return res.status(201).json({
        mensagem: "Agendamento realizado com sucesso!",
        agendamento: novoAgendamento,
      });
    } catch (error) {
      if (t) await t.rollback();
      console.error("🔥 Erro Crítico:", error);
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  },
  ////////////////////////////////////////////
  // 2. CONFIRMAR AGENDAMENTO (Uso do Admin ou Funcionario)
  ////////////////////////////////////////////
  async confirmar(req, res) {
    try {
      const { id } = req.params;
      const statusConfirmado = await StatusAgendamento.findOne({
        where: { nome: "confirmado" },
      });

      await Agendamento.update(
        { status_id: statusConfirmado.id },
        { where: { id } },
      );
      return res.json({ mensagem: "Confirmado com sucesso." });
    } catch (e) {
      return res.status(500).json({ erro: "Erro ao confirmar." });
    }
  },

  ////////////////////////////////////////////
  // 3. CANCELAR (Com Regra das 72h)
  ////////////////////////////////////////////
  // --- FUNÇÃO REAGENDAR ---
  async reagendar(req, res) {
    try {
      const { id } = req.params;
      const { nova_data_hora } = req.body;
      const { usuario_tipo } = req.user; // Pega o tipo do usuário logado

      const agendamento = await Agendamento.findByPk(id, {
        include: [{ model: Servico, as: "Servico" }],
      });
      if (!agendamento)
        return res.status(404).json({ erro: "Não encontrado." });

      // REGRA: Apenas CLIENTES são bloqueados pela regra das 72h
      if (usuario_tipo === "cliente") {
        const agora = new Date(); // ok
        const inicioAtual = new Date(agendamento.data_hora_inicio); // ok

        if (inicioAtual - agora < 72 * 60 * 60 * 1000) {
          return res.status(400).json({
            erro: "Clientes só podem reagendar com 72h de antecedência. Contacte o suporte.",
          });
        }
      }

      // Se chegou aqui (é funcionário ou cliente dentro do prazo), prossegue
      const novo_inicio = new Date(nova_data_hora);
      const duracao = agendamento.Servico?.duracao_minutos || 30;
      const novo_fim = new Date(novo_inicio.getTime() + duracao * 60000);

      const statusReagendado = await StatusAgendamento.findOne({
        where: { nome: "reagendado" },
      });

      // Update (Não importa o status anterior, ele será atualizado para 'reagendado' novamente)
      await agendamento.update({
        data_hora_inicio: novo_inicio,
        data_hora_fim: novo_fim,
        status_id: statusReagendado.id,
      });

      return res.json({
        mensagem:
          "Operação realizada com sucesso pelo administrador/funcionário.",
      });
    } catch (e) {
      return res.status(500).json({ erro: "Erro interno." });
    }
  },

  // --- FUNÇÃO CANCELAR ---
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_tipo } = req.user;

      const agendamento = await Agendamento.findByPk(id);
      if (!agendamento)
        return res.status(404).json({ erro: "Não encontrado." });

      // REGRA: Funcionário/Recepcionista CANCELA QUALQUER UM a qualquer momento
      if (usuario_tipo === "cliente") {
        const agora = new Date();
        const inicio = new Date(agendamento.data_hora_inicio);
        if (inicio - agora < 72 * 60 * 60 * 1000) {
          return res
            .status(400)
            .json({ erro: "Cancelamento bloqueado (Regra 72h)." });
        }
      }

      const statusCancelado = await StatusAgendamento.findOne({
        where: { nome: "cancelado" },
      });
      await agendamento.update({ status_id: statusCancelado.id });

      return res.json({ mensagem: "Agendamento cancelado com sucesso." });
    } catch (e) {
      return res.status(500).json({ erro: "Erro ao cancelar." });
    }
  },

  ////////////////////////////////////////////
  // 5. LISTAR AGENDAMENTOS (Dinâmico por Perfil)
  ////////////////////////////////////////////
  async listar_agendamentos(req, res) {
    try {
      const { id: usuario_id, usuario_tipo } = req.user;
      let filtro = {};

      if (usuario_tipo === "cliente") {
        const c_id = await agendamento_Controller._getClienteId(usuario_id);
        filtro.cliente_id = c_id;
      } else if (usuario_tipo === "funcionario") {
        const f_id = await agendamento_Controller._getFuncId(usuario_id);
        filtro.funcionario_id = f_id;
      }

      const lista = await Agendamento.findAll({
        where: filtro,
        include: [
          {
            model: Cliente,
            include: [{ model: Usuario, attributes: ["nome"] }],
          },
          {
            model: Funcionario,
            include: [{ model: Usuario, attributes: ["nome"] }],
          },
          { model: Servico },
          { model: StatusAgendamento },
        ],
        order: [["data_hora_inicio", "ASC"]],
      });

      return res.json(lista);
    } catch (e) {
      return res.status(500).json({ erro: "Erro ao listar." });
    }
  },
};

export default agendamento_Controller;
