import { pool } from "../database/index.js";
import bcryptjs from "bcryptjs";

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log("🧹 Limpando tabelas (CASCADE)...");
    await client.query(`
      TRUNCATE TABLE 
        pagamento, agendamento, agenda_funcionario, servico_funcionario, 
        promocao, servico, status_agendamento, funcionario, cliente, admin, usuario 
      RESTART IDENTITY CASCADE;
    `);

    const senhaHash = await bcryptjs.hash("teste123", 10);

    // 1. STATUS DE AGENDAMENTO
    console.log("🔖 Criando status...");
    const statusList = ["pendente", "confirmado", "cancelado", "reagendado", "concluido"];
    const statusMap = {};
    for (const s of statusList) {
      const res = await client.query(`INSERT INTO status_agendamento (nome) VALUES ($1) RETURNING id`, [s]);
      statusMap[s] = res.rows[0].id;
    }

    // 2. EQUIPA (1 Admin + 1 Receção + 4 Profissionais)
    console.log("👥 Criando equipa...");
    const equipe = [
      ['Admin Sistema', 'Admin', '900000001', 'admin@beauty.com', 'admin', 'Geral'],
      ['Joana Rececao', 'Joana', '900000002', 'recepcao@beauty.com', 'funcionario', 'recepcao'],
      ['Cristainny Pires', 'Cristainny', '900000003', 'cristainny@beauty.com', 'profissional', 'profissional'],
      ['Sofia Santos', 'Sofia', '900000004', 'sofia@beauty.com', 'profissional', 'profissional'],
      ['Carlos Barber', 'Carlos', '900000005', 'carlos@beauty.com', 'profissional', 'profissional'],
      ['Ana Nails', 'Ana', '900000006', 'ana@beauty.com', 'profissional', 'profissional']
    ];

    const profIds = [];
    for (const [nome, apelido, tel, email, tipoU, tipoF] of equipe) {
      const resU = await client.query(
        `INSERT INTO usuario (nome, apelido, numero_telefone, email, palavra_passe, usuario_tipo, email_verificado, telefone_verificado) 
         VALUES ($1, $2, $3, $4, $5, $6, true, true) RETURNING id`,
        [nome, apelido, tel, email, senhaHash, tipoU]
      );
      const uid = resU.rows[0].id;

      if (tipoU === 'admin') await client.query(`INSERT INTO admin (usuario_id) VALUES ($1)`, [uid]);
      if (tipoU === 'funcionario') {
        const resF = await client.query(
          `INSERT INTO funcionario (usuario_id, tipo, funcao_especialidade, ativo) VALUES ($1, $2, $3, true) RETURNING id`,
          [uid, tipoF, apelido]
        );
        if (tipoF === 'profissional') profIds.push(resF.rows[0].id);
      }
    }

    // 3. CLIENTES (5 Clientes)
    console.log("🛍️ Criando clientes...");
    const clientesData = [
      ['Maria João', 'Maria', '920000001', 'maria@gmail.com'],
      ['Ricardo Silva', 'Ricardo', '920000002', 'ricardo@gmail.com'],
      ['Carla Mendes', 'Carla', '920000003', 'carla@gmail.com'],
      ['Paulo Jorge', 'Paulo', '920000004', 'paulo@gmail.com'],
      ['Bia Antunes', 'Bia', '920000005', 'bia@gmail.com']
    ];
    const cliIds = [];
    for (const [nome, apelido, tel, email] of clientesData) {
      const resU = await client.query(
        `INSERT INTO usuario (nome, apelido, numero_telefone, email, palavra_passe, usuario_tipo, email_verificado, telefone_verificado) 
         VALUES ($1, $2, $3, $4, $5, 'cliente', true, true) RETURNING id`,
        [nome, apelido, tel, email, senhaHash]
      );
      const resC = await client.query(`INSERT INTO cliente (usuario_id) VALUES ($1) RETURNING id`, [resU.rows[0].id]);
      cliIds.push(resC.rows[0].id);
    }

    // 4. SERVIÇOS (4)
    console.log("💅 Criando serviços...");
    const servs = [
        ['Manicure Gel', 45, 1500], 
        ['Corte Masculino', 30, 1000], 
        ['Barba Ritual', 30, 800], 
        ['Limpeza Facial', 60, 2500]
    ];
    const servIds = [];
    for (const [n, d, p] of servs) {
      const res = await client.query(`INSERT INTO servico (nome_servico, duracao_minutos, preco, ativo) VALUES ($1, $2, $3, true) RETURNING id`, [n, d, p]);
      servIds.push(res.rows[0].id);
    }

    // 5. PROMOÇÕES (2)
    console.log("🎁 Criando promoções...");
    await client.query(`
        INSERT INTO promocao (nome, descricao, tipo, valor, data_inicio, data_fim, ativo) 
        VALUES 
        ('Promo Verão', 'Desconto de Verão', 'percentual', 10, NOW(), NOW() + interval '30 days'),
        ('Black Friday', 'Tudo a preço fixo', 'fixo', 500, NOW(), NOW() + interval '10 days')`);

    // 6. 12 AGENDAMENTOS EXATOS
    console.log("📅 Criando 12 agendamentos (4 Passados, 4 Hoje, 4 Futuros)...");

    const formatData = (daysOffset, hour) => {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      date.setHours(hour, 0, 0, 0);
      return date.toISOString();
    };

    const agendamentos = [
      // 4 PASSADOS (Status: Concluido)
      { c: cliIds[0], s: servIds[0], f: profIds[0], st: statusMap.concluido, dt: formatData(-1, 10) },
      { c: cliIds[1], s: servIds[1], f: profIds[1], st: statusMap.concluido, dt: formatData(-1, 14) },
      { c: cliIds[2], s: servIds[2], f: profIds[2], st: statusMap.concluido, dt: formatData(-2, 9) },
      { c: cliIds[3], s: servIds[3], f: profIds[3], st: statusMap.concluido, dt: formatData(-2, 16) },

      // 4 HOJE (Status: Confirmado)
      { c: cliIds[4], s: servIds[0], f: profIds[0], st: statusMap.confirmado, dt: formatData(0, 9) },
      { c: cliIds[0], s: servIds[1], f: profIds[1], st: statusMap.confirmado, dt: formatData(0, 11) },
      { c: cliIds[1], s: servIds[2], f: profIds[2], st: statusMap.confirmado, dt: formatData(0, 15) },
      { c: cliIds[2], s: servIds[3], f: profIds[3], st: statusMap.confirmado, dt: formatData(0, 17) },

      // 4 FUTUROS (Status: Confirmado)
      { c: cliIds[3], s: servIds[0], f: profIds[0], st: statusMap.confirmado, dt: formatData(1, 10) },
      { c: cliIds[4], s: servIds[1], f: profIds[1], st: statusMap.confirmado, dt: formatData(1, 13) },
      { c: cliIds[0], s: servIds[2], f: profIds[2], st: statusMap.confirmado, dt: formatData(2, 8) },
      { c: cliIds[1], s: servIds[3], f: profIds[3], st: statusMap.confirmado, dt: formatData(2, 14) }
    ];

    for (const a of agendamentos) {
      await client.query(
        `INSERT INTO agendamento (cliente_id, servico_id, funcionario_id, status_id, data_hora_inicio, data_hora_fim, criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, $5::timestamp + interval '45 minutes', NOW(), NOW())`,
        [a.c, a.s, a.f, a.st, a.dt]
      );
    }

    console.log("✅ SEED COMPLETO COM SUCESSO!");

  } catch (e) {
    console.error("❌ ERRO DURANTE O SEED:", e.message);
  } finally {
    client.release();
  }
};

export default seed;