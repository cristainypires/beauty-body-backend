import { Agendamento, Usuario, Cliente, Servico, Notificacao, Pagamento, Funcionario } from "../database/index.js";
import { Op, fn, col } from "sequelize";

// ==========================================
// 1. DASHBOARD DO FUNCIONÁRIO (RF11)
// ==========================================

export async function dashboard_funcionario(req, res) {
  try {
    const funcionario_id = req.user.id;
    const { page = 1, limit = 10, status, inicio, fim } = req.query;

    // Construindo filtros
    const filtroHistorico = {
      funcionario_id,
      status: status || "concluido"
    };

    if (inicio && fim) {
      filtroHistorico.data_hora_fim = {
        [Op.between]: [new Date(inicio), new Date(fim)]
      };
    }

    // Estatísticas resumidas
    const resumo_status = await Agendamento.findAll({
      where: { funcionario_id },
      attributes: ['status', [fn('COUNT', col('id')), 'quantidade']],
      group: ['status']
    });

    // Próximos agendamentos
    const proximos_agendamentos = await Agendamento.findAll({
      where: {
        funcionario_id,
        status: { [Op.in]: ["confirmado", "pendente"] },
        data_hora_inicio: { [Op.gte]: new Date() }
      },
      include: [
        { model: Cliente, include: [{ model: Usuario, attributes: ['nome', 'apelido'] }] },
        { model: Servico, attributes: ['nome_servico', 'duracao_minutos'] }
      ],
      order: [["data_hora_inicio", "ASC"]],
      limit: 10
    });

    // Histórico com paginação
    const offset = (page - 1) * limit;
    const { count, rows: historico } = await Agendamento.findAndCountAll({
      where: filtroHistorico,
      include: [
        { model: Cliente, include: [{ model: Usuario, attributes: ['nome'] }] },
        { model: Servico, attributes: ['nome_servico', 'preco'] }
      ],
      order: [["data_hora_fim", "DESC"]],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      resumo_status,
      proximos_agendamentos,
      historico,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        totalItems: count
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao carregar dashboard do funcionário." });
  }
}


// ==========================================
// 2. DASHBOARD DO ADMIN (RF12 / RF14.7)
// ==========================================
export async function dashboard_admin(req, res) {
  try {
    const { page = 1, limit = 20, status, inicio, fim } = req.query;

    // Filtros de agendamento
    const filtroAgendamento = {};
    if (status) filtroAgendamento.status = status;
    if (inicio && fim) filtroAgendamento.data_hora_inicio = { [Op.between]: [new Date(inicio), new Date(fim)] };

    const offset = (page - 1) * limit;

    const { count, rows: agendamentos } = await Agendamento.findAndCountAll({
      where: filtroAgendamento,
      include: [
        { model: Cliente, include: [{ model: Usuario, attributes: ['nome', 'email', 'numero_telefone'] }] },
        { model: Servico, attributes: ['nome_servico', 'preco'] },
        { model: Usuario, as: "funcionario", attributes: ['nome', 'apelido'] }
      ],
      order: [["data_hora_inicio", "ASC"]],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(count / limit);

    // Estatísticas rápidas
    const total_clientes = await Cliente.count();
    const total_funcionarios = await Funcionario.count();
    const faturamento = await Pagamento.sum('valor', { where: { status: 'pago' } }) || 0;

    res.json({
      utilizadores: { clientes: total_clientes, funcionarios: total_funcionarios },
      agendamentos,
      faturamento_total: faturamento,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        totalItems: count
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao gerar dashboard administrativo." });
  }
}
