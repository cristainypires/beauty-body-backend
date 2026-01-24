import { pool } from "../database/index.js";
import bcryptjs from "bcryptjs";

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log("🧹 Limpando todas as tabelas principais...");
    await client.query(
      `TRUNCATE TABLE pagamento, lembrete, notificacao, auditoria_logs, promocao_servico, promocao, agendamento, agenda_funcionario, servico_funcionario, servico, canal_lembrete, canal_notificacao, status_lembrete, status_notificacao, status_agendamento, funcionario, cliente, admin, usuario RESTART IDENTITY CASCADE;`
    );
    console.log("✅ Todas as tabelas limpas!\n");

    console.log("🌱 Iniciando população de dados de teste...\n");

    // ==============================
    // STATUS DE AGENDAMENTO
    // ==============================
    console.log("🔖 Criando status de agendamento...");
    const statusList = ["pendente", "confirmado", "cancelado", "reagendado", "concluido", "concluído"];
    for (const s of statusList) {
      await client.query(
        `INSERT INTO status_agendamento (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING;`,
        [s]
      );
    }
    console.log("✅ Status de agendamento criados!\n");

    // ==============================
    // USUÁRIOS
    // ==============================
    console.log("👤 Criando usuários...");
    const senhaHash = await bcryptjs.hash("teste123", 10);
    await client.query(
      `
      INSERT INTO usuario (nome, apelido, numero_telefone, data_nascimento, email, palavra_passe, usuario_tipo, email_verificado, telefone_verificado)
      VALUES 
        ('Admin Sistema', 'Admin', '912345678', '1990-01-15', 'admin@beauty.com', $1, 'admin', true, true),
        ('Cristainny Pires', 'Cristainny', '914567890', '1995-03-20', 'cristainny@beauty.com', $1, 'funcionario', true, true),
        ('Sofia Santos', 'Sofia', '915678901', '1998-05-10', 'sofia@beauty.com', $1, 'funcionario', true, true),
        ('Joana Recepcao', 'Joana', '919999999', '1999-01-01', 'recepcao@beauty.com', $1, 'funcionario', true, true)
      ON CONFLICT (email) DO NOTHING;
      `,
      [senhaHash]
    );
    console.log("✅ Usuários criados!\n");

    // ==============================
    // CLIENTES
    // ==============================
    console.log("🛍️ Criando clientes...");
    const clientesNovos = [
      { nome: "Maria João", email: "maria@beauty.com", telefone: "916789012" },
      { nome: "Ana Silva", email: "ana@beauty.com", telefone: "917890123" },
      { nome: "Joana Martins", email: "joana@beauty.com", telefone: "918901234" },
      { nome: "Carlos Gomes", email: "carlos@beauty.com", telefone: "919876543" },
      { nome: "Paula Mendes", email: "paula@beauty.com", telefone: "914321987" }
    ];

    for (const c of clientesNovos) {
      await client.query(
        `INSERT INTO usuario (nome, apelido, numero_telefone, data_nascimento, email, palavra_passe, usuario_tipo, email_verificado, telefone_verificado)
         VALUES ($1,$2,$3,'1990-01-01',$4,$5,'cliente',true,true)
         ON CONFLICT (email) DO NOTHING;`,
        [c.nome, c.nome.split(" ")[0], c.telefone, c.email, senhaHash]
      );
    }

    await client.query(`
      INSERT INTO cliente (usuario_id)
      SELECT id FROM usuario WHERE usuario_tipo = 'cliente'
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Clientes criados!\n");

    // ==============================
    // ADMIN
    // ==============================
    console.log("👨‍💼 Criando administrador...");
    await client.query(`
      INSERT INTO admin (usuario_id)
      SELECT id FROM usuario WHERE usuario_tipo = 'admin'
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Administrador criado!\n");

    // ==============================
    // FUNCIONÁRIOS
    // ==============================
    console.log("💼 Criando funcionários...");
    await client.query(`
      INSERT INTO funcionario (usuario_id, tipo, funcao_especialidade, ativo)
      SELECT 
        id, 
        CASE 
          WHEN nome LIKE '%Joana Recepcao%' THEN 'recepcao'
          ELSE 'profissional'
        END,
        CASE 
          WHEN nome LIKE '%Cristainny%' THEN 'Manicure e Pedicure'
          WHEN nome LIKE '%Sofia%' THEN 'Cabelo e Corte'
          WHEN nome LIKE '%Joana Recepcao%' THEN 'Atendimento e Agendamento'
          ELSE 'Massagem'
        END,
        true
      FROM usuario 
      WHERE usuario_tipo = 'funcionario'
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Funcionários criados!\n");

    // ==============================
    // SERVIÇOS
    // ==============================
    console.log("💅 Criando serviços...");
    const servicos = [
      { nome: 'Manicure Simples', duracao: 30, preco: 15 },
      { nome: 'Manicure Gel', duracao: 45, preco: 25 },
      { nome: 'Pedicure Simples', duracao: 40, preco: 20 },
      { nome: 'Limpeza de Pele', duracao: 60, preco: 35 }
    ];
    for (const s of servicos) {
      await client.query(`
        INSERT INTO servico (nome_servico, duracao_minutos, preco, ativo)
        VALUES ($1,$2,$3,true)
        ON CONFLICT DO NOTHING;
      `, [s.nome, s.duracao, s.preco]);
    }
    console.log("✅ Serviços criados!\n");

    // ==============================
    // ASSOCIA SERVIÇOS A FUNCIONÁRIOS
    // ==============================
    console.log("🔗 Associando serviços aos funcionários...");
    // Cristainny – Manicure e Pedicure
    await client.query(`
      INSERT INTO servico_funcionario (servico_id, funcionario_id, habilitado)
      SELECT s.id, f.id, true
      FROM servico s
      CROSS JOIN funcionario f
      JOIN usuario u ON u.id = f.usuario_id
      WHERE f.funcao_especialidade='Manicure e Pedicure' AND (s.nome_servico LIKE '%Manicure%' OR s.nome_servico LIKE '%Pedicure%')
      ON CONFLICT DO NOTHING;
    `);

    // Sofia – Limpeza de Pele
    await client.query(`
      INSERT INTO servico_funcionario (servico_id, funcionario_id, habilitado)
      SELECT s.id, f.id, true
      FROM servico s
      JOIN funcionario f ON true
      JOIN usuario u ON u.id=f.usuario_id
      WHERE s.nome_servico='Limpeza de Pele' AND u.email='sofia@beauty.com'
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Serviços associados aos funcionários!\n");

    // ==============================
    // CRIA AGENDA FUNCIONÁRIOS
    // ==============================
    console.log("📅 Criando agenda dos funcionários...");
    await client.query(`
      INSERT INTO agenda_funcionario (funcionario_id, dia_semana, hora_inicio, hora_fim, disponivel)
      SELECT f.id, day, hora_start::TIME, hora_end::TIME, true
      FROM funcionario f
      CROSS JOIN (SELECT generate_series(0,6) as day, '09:00' as hora_start, '18:00' as hora_end) schedule
      WHERE NOT EXISTS (
        SELECT 1 FROM agenda_funcionario a
        WHERE a.funcionario_id = f.id AND a.dia_semana = day AND a.hora_inicio = hora_start::TIME
      );
    `);
    console.log("✅ Agenda dos funcionários criada!\n");

    // ==============================
    // AGENDAMENTOS FUTUROS, HOJE E PASSADOS
    // ==============================
    console.log("📆 Criando agendamentos para todos os clientes e funcionários (Cristainny e Sofia)...");

    const clientes = await client.query(`SELECT id, usuario_id FROM cliente`);
    const funcionarios = await client.query(`
      SELECT f.id, u.email FROM funcionario f
      JOIN usuario u ON u.id=f.usuario_id
      WHERE u.email IN ('cristainny@beauty.com','sofia@beauty.com')
    `);
    const servicosAll = await client.query(`SELECT id, nome_servico FROM servico`);

    // status map
    const statusMap = {};
    for (const s of statusList) {
      const r = await client.query(`SELECT id FROM status_agendamento WHERE nome=$1 LIMIT 1`, [s]);
      if (r.rows[0]) statusMap[s] = r.rows[0].id;
    }

    // datas: ontem, hoje, amanhã
    const datas = [
      new Date(Date.now() - 24*60*60*1000),
      new Date(),
      new Date(Date.now() + 24*60*60*1000)
    ];

    for (const { id: fId, email } of funcionarios.rows) {
      for (const c of clientes.rows) {
        for (const data of datas) {
          let offset = 0;
          for (const statusId of Object.values(statusMap)) {
            const inicio = new Date(data.getTime() + offset*60000);
            const servicoId = servicosAll.rows.find(s => 
              (email.includes('cristainny') && s.nome_servico.includes('Manicure')) ||
              (email.includes('sofia') && s.nome_servico.includes('Limpeza'))
            )?.id;
            if (!servicoId) continue;

            const fim = new Date(inicio.getTime() + 30*60000);
            offset += 15;

            await client.query(`
              INSERT INTO agendamento (cliente_id, servico_id, funcionario_id, status_id, data_hora_inicio, data_hora_fim)
              VALUES ($1,$2,$3,$4,$5,$6)
              ON CONFLICT DO NOTHING;
            `, [c.id, servicoId, fId, statusId, inicio.toISOString(), fim.toISOString()]);
          }
        }
      }
    }

    console.log("✅ Agendamentos criados para passado, hoje e futuro para Cristainny e Sofia!\n");

    console.log("✅ POPULAÇÃO DE DADOS CONCLUÍDA COM SUCESSO!\n");
  } catch (error) {
    console.error("❌ Erro ao popular dados:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

export default seed;
