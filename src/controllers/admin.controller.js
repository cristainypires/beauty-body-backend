import { Op } from "sequelize";

const admin_Controller = {

  ////////////////////////////////////////////
  // 1. GERENCIAR SERVIÇOS
  ////////////////////////////////////////////

  // Listar todos os serviços (ativos e inativos)
  async listar_servicos(req, res) {
    try {
      const servicos = await Servico.findAll({
        attributes: ["id", "nome_servico", "duracao_minutos", "preco", "ativo"],
        order: [["nome_servico", "ASC"]],
      });
      return res.json(servicos);
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar serviços." });
    }
  },

  // Criar um novo serviço
  async criar_servico(req, res) {
    try {
      const { nome_servico, duracao_minutos, preco } = req.body;
      if (!nome_servico || !duracao_minutos || !preco)
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." });

      const servico = await Servico.create({ nome_servico, duracao_minutos, preco, ativo: true });
      return res.json({ mensagem: "Serviço criado com sucesso.", servico });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao criar serviço." });
    }
  },

  // Atualizar um serviço
  async atualizar_servico(req, res) {
    try {
      const { servico_id } = req.params;
      const { nome_servico, duracao_minutos, preco, ativo } = req.body;

      const servico = await Servico.findByPk(servico_id);
      if (!servico) return res.status(404).json({ erro: "Serviço não encontrado." });

      await servico.update({ nome_servico, duracao_minutos, preco, ativo });
      return res.json({ mensagem: "Serviço atualizado com sucesso.", servico });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao atualizar serviço." });
    }
  },

  // Remover ou desativar serviço
  async remover_servico(req, res) {
    try {
      const { servico_id } = req.params;
      const servico = await Servico.findByPk(servico_id);
      if (!servico) return res.status(404).json({ erro: "Serviço não encontrado." });

      // Apenas desativa para manter histórico
      await servico.update({ ativo: false });
      return res.json({ mensagem: "Serviço desativado com sucesso." });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao desativar serviço." });
    }
  },

  ////////////////////////////////////////////
  // 2. GERENCIAR FUNCIONÁRIOS
  ////////////////////////////////////////////

  async listar_funcionarios(req, res) {
    try {
      const funcionarios = await Funcionario.findAll({
        attributes: ["id", "nome", "email", "ativo"],
        order: [["nome", "ASC"]],
      });
      return res.json(funcionarios);
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar funcionários." });
    }
  },

  async criar_funcionario(req, res) {
    try {
      const { nome, email, senha } = req.body;
      if (!nome || !email || !senha) return res.status(400).json({ erro: "Campos obrigatórios." });

      const funcionario = await Funcionario.create({ nome, email, senha, ativo: true });
      return res.json({ mensagem: "Funcionário criado com sucesso.", funcionario });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao criar funcionário." });
    }
  },

  async atualizar_funcionario(req, res) {
    try {
      const { funcionario_id } = req.params;
      const { nome, email, ativo } = req.body;

      const funcionario = await Funcionario.findByPk(funcionario_id);
      if (!funcionario) return res.status(404).json({ erro: "Funcionário não encontrado." });

      await funcionario.update({ nome, email, ativo });
      return res.json({ mensagem: "Funcionário atualizado com sucesso.", funcionario });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao atualizar funcionário." });
    }
  },

  async remover_funcionario(req, res) {
    try {
      const { funcionario_id } = req.params;
      const funcionario = await Funcionario.findByPk(funcionario_id);
      if (!funcionario) return res.status(404).json({ erro: "Funcionário não encontrado." });

      // Apenas desativa
      await funcionario.update({ ativo: false });
      return res.json({ mensagem: "Funcionário desativado com sucesso." });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao desativar funcionário." });
    }
  },

  ////////////////////////////////////////////
  // 3. GERENCIAR CLIENTES
  ////////////////////////////////////////////

  async listar_clientes(req, res) {
    try {
      const clientes = await Cliente.findAll({
        attributes: ["id", "nome", "email", "numero_telefone", "ativo"],
        order: [["nome", "ASC"]],
      });
      return res.json(clientes);
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar clientes." });
    }
  },

  async desativar_cliente(req, res) {
    try {
      const { cliente_id } = req.params;
      const cliente = await Cliente.findByPk(cliente_id);
      if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });

      await cliente.update({ ativo: false });
      return res.json({ mensagem: "Cliente desativado com sucesso." });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao desativar cliente." });
    }
  },

  ////////////////////////////////////////////
  // 4. GERENCIAR AGENDAMENTOS
  ////////////////////////////////////////////

  async listar_agendamentos(req, res) {
    try {
      const agendamentos = await Agendamento.findAll({
        include: [
          { model: Cliente, attributes: ["nome", "numero_telefone"] },
          { model: Funcionario, attributes: ["nome"] },
          { model: Servico, attributes: ["nome_servico"] },
        ],
        order: [["data_hora_inicio", "DESC"]],
      });

      return res.json(agendamentos);
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao buscar agendamentos." });
    }
  },

  async cancelar_agendamento(req, res) {
    try {
      const { agendamento_id } = req.params;
      const agendamento = await Agendamento.findByPk(agendamento_id);
      if (!agendamento) return res.status(404).json({ erro: "Agendamento não encontrado." });

      await agendamento.update({ status: "cancelado" });
      return res.json({ mensagem: "Agendamento cancelado com sucesso." });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao cancelar agendamento." });
    }
  },

  async reagendar_agendamento(req, res) {
    try {
      const { agendamento_id } = req.params;
      const { nova_data_hora_inicio, nova_data_hora_fim } = req.body;

      const agendamento = await Agendamento.findByPk(agendamento_id);
      if (!agendamento) return res.status(404).json({ erro: "Agendamento não encontrado." });

      await agendamento.update({ data_hora_inicio: nova_data_hora_inicio, data_hora_fim: nova_data_hora_fim, status: "confirmado" });
      return res.json({ mensagem: "Agendamento reagendado com sucesso.", agendamento });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao reagendar agendamento." });
    }
  },
};





async function gerar_relatorio_financeiro(req, res) {
  try {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
      return res.status(400).json({ erro: "Parâmetros data_inicio e data_fim são obrigatórios." });
    }

    const agendamentos = await Agendamento.findAll({
      where: {
        data_hora_inicio: {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)],
        },
        status: "confirmado",
      },
      include: [{ model: Servico, attributes: ["preco"] }],
    });

    const total_receita = agendamentos.reduce((total, agendamento) => {
      return total + (agendamento.Servico ? agendamento.Servico.preco : 0);
    }, 0);

    return res.json({
      data_inicio,
      data_fim,
      total_agendamentos: agendamentos.length,
      total_receita,
    });
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao gerar relatório financeiro." });
  }
}








export default admin_Controller;