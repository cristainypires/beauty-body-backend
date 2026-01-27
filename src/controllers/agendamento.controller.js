import { Op } from "sequelize";
import bcryptjs from "bcryptjs";

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

      // --- 1. VERIFICAÇÕES PARA NOVO CLIENTE ---
      if (!final_cliente_id && novo_cliente_nome) {
        const telefoneLimpo = novo_cliente_telefone
          .replace(/\D/g, "")
          .slice(0, 7);

        if (telefoneLimpo.length !== 7) {
          await t.rollback();
          return res
            .status(400)
            .json({ erro: "O telefone deve ter exatamente 7 números." });
        }

        // A) Verificar se o E-MAIL já existe
        const existeEmail = await Usuario.findOne({
          where: { email: novo_cliente_email },
          attributes: ["id", "nome"],
        });
        if (existeEmail) {
          await t.rollback();
          return res.status(400).json({
            erro: `O e-mail '${novo_cliente_email}' já pertence a '${existeEmail.nome}'. Verifique na aba 'Cliente da Casa'.`,
          });
        }

        // B) Verificar se o TELEFONE já existe
        const existeTelefone = await Usuario.findOne({
          where: { numero_telefone: telefoneLimpo },
          attributes: ["id", "nome"],
        });
        if (existeTelefone) {
          await t.rollback();
          return res.status(400).json({
            erro: `O telefone '${telefoneLimpo}' já está cadastrado para '${existeTelefone.nome}'.`,
          });
        }

        // C) Verificar se o NOME já existe (Aviso de duplicidade de nome)
        const existeNome = await Usuario.findOne({
          where: { nome: novo_cliente_nome },
          attributes: ["id", "email"],
        });
        if (existeNome) {
          await t.rollback();
          return res.status(400).json({
            erro: `Já existe um cliente com o nome '${novo_cliente_nome}' (E-mail: ${existeNome.email}). Deseja usar o cadastro existente?`,
          });
        }

        // Se passou em todas as verificações, cria o usuário
        const senhaHash = await bcryptjs.hash(telefoneLimpo, 10);
        // ... dentro de fazer_agendamento ...

        const novoUsuario = await Usuario.create(
          {
            nome: novo_cliente_nome,
            // GERANDO APELIDO AUTOMÁTICO: pega a primeira palavra do nome
            apelido: novo_cliente_nome.split(" ")[0],
            email: novo_cliente_email,
            numero_telefone: telefoneLimpo,
            palavra_passe: senhaHash,
            usuario_tipo: "cliente",
            email_verificado: true,
          },
          { transaction: t },
        );

        // ... resto do código

        const novoCliente = await Cliente.create(
          { usuario_id: novoUsuario.id },
          { transaction: t },
        );
        final_cliente_id = novoCliente.id;
      }

      if (!final_cliente_id) {
        await t.rollback();
        return res
          .status(400)
          .json({ erro: "Selecione um cliente ou cadastre um novo." });
      }

      // --- 2. VALIDAÇÃO DE CONFLITOS DE HORÁRIO ---
      const inicio = new Date(
        data_hora_inicio.endsWith("Z")
          ? data_hora_inicio
          : `${data_hora_inicio}:00.000Z`,
      );
      const servico = await Servico.findByPk(servico_id, {
        attributes: ["id", "duracao_minutos"],
      });

      if (!servico) {
        await t.rollback();
        return res.status(404).json({ erro: "Serviço não encontrado." });
      }
      console.log("Data recebida do frontend:", data_hora_inicio);

      if (!data_hora_inicio) {
        await t.rollback();
        return res
          .status(400)
          .json({ erro: "A data de início é obrigatória." });
      }
      const fim = new Date(inicio.getTime() + servico.duracao_minutos * 60000);
      const statusCancelado = await StatusAgendamento.findOne({
        where: { nome: "cancelado" },
        attributes: ["id"],
      });

      const conflito = await Agendamento.findOne({
        where: {
          funcionario_id,
          status_id: { [Op.ne]: statusCancelado ? statusCancelado.id : 0 },
          [Op.or]: [
            { data_hora_inicio: { [Op.between]: [inicio, fim] } },
            { data_hora_fim: { [Op.between]: [inicio, fim] } },
          ],
        },
      });

      if (conflito) {
        await t.rollback();
        return res
          .status(409)
          .json({ erro: "O profissional já tem outro serviço neste horário." });
      }

      // --- 3. FINALIZAR AGENDAMENTO ---
      const statusConfirmado = await StatusAgendamento.findOne({
        where: { nome: "confirmado" },
        attributes: ["id"],
      });
      const novoAgendamento = await Agendamento.create(
        {
          cliente_id: final_cliente_id,
          servico_id,
          funcionario_id,
          status_id: statusConfirmado.id,
          data_hora_inicio: inicio,
          data_hora_fim: fim,
        },
        { transaction: t },
      );

      await t.commit();
      return res.status(201).json({
        mensagem: "Agendamento concluído com sucesso!",
        agendamento: novoAgendamento,
      });
    } catch (error) {
      if (t) await t.rollback();
      console.error(error);
      return res
        .status(500)
        .json({ erro: "Erro interno no servidor.", detalhe: error.message });
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
