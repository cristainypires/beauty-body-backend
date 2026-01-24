import { query } from "../db/index.js";

const seed = async () => {
  console.log("🌱 Populando dados para bater com o Dashboard...");

  // 1. CRIAR PROFISSIONAL (Sofia Santos)
  const resSofia = await query(`
    INSERT INTO usuario (nome, apelido, numero_telefone, email, palavra_passe, usuario_tipo, email_verificado)
    VALUES ('Sofia Santos', 'Sofia', '915678901', 'sofia@beauty.com', 'senha123', 'funcionario', true)
    ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
    RETURNING id
  `);
  const sofiaId = resSofia.rows[0].id;

  await query(`
    INSERT INTO funcionario (usuario_id, tipo, funcao_especialidade, ativo)
    VALUES ($1, 'profissional', 'Cabelo e Corte', true)
    ON CONFLICT DO NOTHING
  `, [sofiaId]);

  // 2. CRIAR SERVIÇOS
  const resServico = await query(`
    INSERT INTO servico (nome_servico, duracao_minutos, preco, ativo)
    VALUES ('Limpeza de Pele', 60, 2500), ('Manicure', 45, 1500)
    ON CONFLICT (nome_servico) DO UPDATE SET preco = EXCLUDED.preco
    RETURNING id
  `);
  const limpezaPeleId = resServico.rows[0].id;

  // 3. CRIAR CLIENTE (Maria João)
  const resMaria = await query(`
    INSERT INTO usuario (nome, apelido, numero_telefone, email, palavra_passe, usuario_tipo, email_verificado)
    VALUES ('Maria João', 'Maria', '916789012', 'maria@email.com', 'senha123', 'cliente', true)
    ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
    RETURNING id
  `);
  const mariaId = resMaria.rows[0].id;
  
  const resCliente = await query(`
    INSERT INTO cliente (usuario_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id
  `, [mariaId]);
  const clienteId = resCliente.rows[0]?.id;

  // 4. CRIAR STATUS
  await query(`INSERT INTO status_agendamento (nome) VALUES ('confirmado'), ('concluido') ON CONFLICT DO NOTHING`);

  // 5. CRIAR AGENDAMENTOS (Para bater com os números 1 e 2 do Dashboard)
  
  // Próximo Serviço (1): Maria João hoje às 12:46
  const hoje = new Date();
  hoje.setHours(12, 46, 0, 0);

  await query(`
    INSERT INTO agendamento (cliente_id, servico_id, funcionario_id, status_id, data_hora_inicio, data_hora_fim)
    SELECT $1, $2, f.id, (SELECT id FROM status_agendamento WHERE nome = 'confirmado'), $3, $3 + interval '1 hour'
    FROM funcionario f WHERE f.usuario_id = $4
  `, [clienteId, limpezaPeleId, hoje.toISOString(), sofiaId]);

  // Serviços Concluídos (2): Criar 2 registros no passado
  await query(`
    INSERT INTO agendamento (cliente_id, servico_id, funcionario_id, status_id, data_hora_inicio, data_hora_fim)
    SELECT $1, $2, f.id, (SELECT id FROM status_agendamento WHERE nome = 'concluido'), NOW() - interval '1 day', NOW() - interval '23 hours'
    FROM funcionario f WHERE f.usuario_id = $3
    LIMIT 2
  `, [clienteId, limpezaPeleId, sofiaId]);

  console.log("✅ Banco de dados sincronizado com o Dashboard!");
};

seed();