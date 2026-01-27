import { query } from "../database/index.js";

// ==========================================
// 1. DASHBOARD DO FUNCIONÁRIO
// ==========================================
export async function dashboard_funcionario(req, res) {
  try {
    const usuario_id = req.user.id; 
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 1. Primeiro, pegamos o ID real do funcionário na tabela 'funcionario'
    const funcRes = await query("SELECT id FROM funcionario WHERE usuario_id = $1", [usuario_id]);
    if (funcRes.rows.length === 0) return res.status(404).json({ erro: "Funcionário não encontrado." });
    const funcionario_id = funcRes.rows[0].id;

    // 2. Próximos agendamentos (Pendentes ou Confirmados)
    const proximos = await query(
      `SELECT 
        a.id, u_cli.nome AS cliente_nome, u_cli.numero_telefone AS cliente_telefone,
        s.nome_servico, s.preco, a.data_hora_inicio, sa.nome AS status
      FROM agendamento a
      JOIN cliente c ON a.cliente_id = c.id
      JOIN usuario u_cli ON c.usuario_id = u_cli.id
      JOIN servico s ON a.servico_id = s.id
      JOIN status_agendamento sa ON a.status_id = sa.id
      WHERE a.funcionario_id = $1 
        AND a.data_hora_inicio >= NOW()
        AND sa.nome IN ('confirmado', 'pendente')
      ORDER BY a.data_hora_inicio ASC LIMIT 5`,
      [funcionario_id]
    );

    // 3. Histórico completo (Paginação)
    const historico = await query(
      `SELECT 
        a.id, u_cli.nome AS cliente_nome, s.nome_servico, s.preco,
        a.data_hora_inicio, sa.nome AS status
      FROM agendamento a
      JOIN cliente c ON a.cliente_id = c.id
      JOIN usuario u_cli ON c.usuario_id = u_cli.id
      JOIN servico s ON a.servico_id = s.id
      JOIN status_agendamento sa ON a.status_id = sa.id
      WHERE a.funcionario_id = $1
      ORDER BY a.data_hora_inicio DESC LIMIT $2 OFFSET $3`,
      [funcionario_id, limit, offset]
    );

    // 4. Total para paginação
    const totalCount = await query("SELECT COUNT(*) FROM agendamento WHERE funcionario_id = $1", [funcionario_id]);

    res.json({
      proximos_agendamentos: proximos.rows,
      historico: historico.rows,
      total_geral: parseInt(totalCount.rows[0].count),
      pagina_atual: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro no dashboard do funcionário.", detalhes: error.message });
  }
}

// ==========================================
// 2. DASHBOARD DO ADMIN
// ==========================================
export async function dashboard_admin(req, res) {
  try {
    const { limit = 10 } = req.query;

    // 1. Métricas Globais
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM cliente) as total_clientes,
        (SELECT COUNT(*) FROM funcionario WHERE ativo = true) as total_funcionarios,
        (SELECT COUNT(*) FROM agendamento WHERE data_hora_inicio::date = CURRENT_DATE) as agendamentos_hoje,
        (SELECT COALESCE(SUM(valor), 0) FROM pagamento WHERE status = 'pago') as faturamento_total
    `);

    // 2. Últimos Agendamentos do Sistema
    const agendamentos = await query(`
      SELECT 
        a.id, u_cli.nome as cliente, u_func.nome as funcionario,
        s.nome_servico, a.data_hora_inicio, sa.nome as status
      FROM agendamento a
      JOIN cliente c ON a.cliente_id = c.id
      JOIN usuario u_cli ON c.usuario_id = u_cli.id
      JOIN funcionario f ON a.funcionario_id = f.id
      JOIN usuario u_func ON f.usuario_id = u_func.id
      JOIN servico s ON a.servico_id = s.id
      JOIN status_agendamento sa ON a.status_id = sa.id
      ORDER BY a.criado_em DESC LIMIT $1`, 
      [limit]
    );

    // 3. Agendamentos por Status (Gráfico)
    const porStatus = await query(`
      SELECT sa.nome, COUNT(a.id) 
      FROM agendamento a 
      JOIN status_agendamento sa ON a.status_id = sa.id 
      GROUP BY sa.nome
    `);

    res.json({
      metricas: stats.rows[0],
      ultimos_agendamentos: agendamentos.rows,
      distribuicao_status: porStatus.rows
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro no dashboard admin.", detalhes: error.message });
  }
}

// ==========================================
// 3. DASHBOARD DO CLIENTE
// ==========================================
export async function dashboard_cliente(req, res) {
  try {
    const usuario_id = req.user.id;

    // Buscar ID do cliente
    const cliRes = await query("SELECT id FROM cliente WHERE usuario_id = $1", [usuario_id]);
    if (cliRes.rows.length === 0) return res.status(404).json({ erro: "Cliente não encontrado." });
    const cliente_id = cliRes.rows[0].id;

    // Próximo agendamento (O que ele tem marcado agora)
    const proximo = await query(`
      SELECT 
        a.data_hora_inicio, s.nome_servico, u_func.nome as funcionario_nome, sa.nome as status
      FROM agendamento a
      JOIN funcionario f ON a.funcionario_id = f.id
      JOIN usuario u_func ON f.usuario_id = u_func.id
      JOIN servico s ON a.servico_id = s.id
      JOIN status_agendamento sa ON a.status_id = sa.id
      WHERE a.cliente_id = $1 AND a.data_hora_inicio >= NOW() AND sa.nome != 'cancelado'
      ORDER BY a.data_hora_inicio ASC LIMIT 1
    `, [cliente_id]);

    // Histórico de compras/serviços
    const servicosRealizados = await query(`
      SELECT COUNT(*) FROM agendamento a
      JOIN status_agendamento sa ON a.status_id = sa.id
      WHERE a.cliente_id = $1 AND sa.nome = 'concluido'
    `, [cliente_id]);

    res.json({
      proximo_agendamento: proximo.rows[0] || null,
      total_servicos_concluidos: parseInt(servicosRealizados.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro no dashboard cliente.", detalhes: error.message });
  }
}