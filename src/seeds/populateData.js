import { pool } from "../database/index.js";
import bcryptjs from "bcryptjs";

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log("🧹 Limpando todas as tabelas (CASCADE)...");
    await client.query(`
      TRUNCATE TABLE 
        pagamento, agendamento, agenda_funcionario, servico_funcionario, 
        promocao, servico, status_agendamento, funcionario, cliente, admin, usuario 
      RESTART IDENTITY CASCADE;
    `);

    const senhaHash = await bcryptjs.hash("teste123", 10);

    // 1. STATUS DE AGENDAMENTO
    console.log("🔖 Criando status de agendamento...");
    const statusList = ["pendente", "confirmado", "cancelado", "reagendado", "concluido"];
    const statusMap = {};
    for (const s of statusList) {
      const res = await client.query(`INSERT INTO status_agendamento (nome) VALUES ($1) RETURNING id`, [s]);
      statusMap[s] = res.rows[0].id;
    }

    // 2. EQUIPA E PROFISSIONAIS
    console.log("👥 Criando equipa e profissionais...");
    const equipe = [
  ['Admin Sistema', 'Admin', '900000001', 'admin@maddietavares.cv', 'admin', 'Administrador'],
  ['Esteticista', 'profissional', '90000000', 'cristainny@maddietavares.cv', 'profissional', 'Esteticista'],
  [`Recepcionista`, `Recepcionista`,`326945562`,`recepcao@maddietavares.cv`,`funcionario`,`Recepcionista`]
];



    const profMap = {}; // Para guardar IDs dos profissionais

    for (const [nome, apelido, tel, email, tipoU, especialidade] of equipe) {
      const resU = await client.query(
        `INSERT INTO usuario (nome, apelido, numero_telefone, email, palavra_passe, usuario_tipo, email_verificado, telefone_verificado) 
         VALUES ($1, $2, $3, $4, $5, $6, true, true) RETURNING id`,
        [nome, apelido, tel, email, senhaHash, tipoU]
      );
      
      const uid = resU.rows[0].id;

      if (tipoU === 'admin') {
        await client.query(`INSERT INTO admin (usuario_id) VALUES ($1)`, [uid]);
      } else {
        const tipoF = (especialidade === 'Recepcionista') ? 'funcionario' : 'profissional';
        const resF = await client.query(
          `INSERT INTO funcionario (usuario_id, tipo, funcao_especialidade, ativo) VALUES ($1, $2, $3, true) RETURNING id`,
          [uid, tipoF, especialidade]
        );

        // 3. CONFIGURAR AGENDA (08:00 - 19:00, Seg a Sab)
        if (tipoF === 'profissional') {
          profMap[especialidade] = resF.rows[0].id;
          console.log(`📅 Configurando horário 08h-19h para: ${nome}`);
          
          for (let dia = 1; dia <= 6; dia++) { // 1=Segunda, 6=Sábado
            await client.query(
              `INSERT INTO agenda_funcionario (funcionario_id, dia_semana, hora_inicio, hora_fim, disponivel) 
               VALUES ($1, $2, '08:00:00', '19:00:00', true)`,
              [resF.rows[0].id, dia]
            );
          }
        }
      }
    }

    // 4. SERVIÇOS E ASSOCIAÇÃO (Correção aqui)
    console.log("💅 Criando serviços e associando aos profissionais via servico_funcionario...");
    const servicosData = [
      
    ];

    const servMap = {}; // Para guardar IDs dos serviços criados

    for (const [nome, duracao, preco, fId] of servicosData) {
      // Primeiro inserimos na tabela servico (sem a coluna funcionario_id que não existe)
      const resS = await client.query(
        `INSERT INTO servico (nome_servico, duracao_minutos, preco, ativo) 
         VALUES ($1, $2, $3, true) RETURNING id`,
        [nome, duracao, preco]
      );
      const sId = resS.rows[0].id;
      servMap[nome] = sId;

      // Agora criamos a ligação na tabela servico_funcionario
      await client.query(
        `INSERT INTO servico_funcionario (servico_id, funcionario_id) VALUES ($1, $2)`,
        [sId, fId]
      );
    }

    // 5. CLIENTES
    console.log("🛍️ Criando clientes...");
    const clientesData = [
     
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

    // 6. AGENDAMENTOS DE TESTE
    console.log("📅 Criando agendamentos de teste...");
    const formatData = (daysOffset, hour) => {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      date.setHours(hour, 0, 0, 0);
      return date;
    };

    const testes = [
      { c: cliIds[0], s: servMap['Limpeza de Pele Profunda'], f: profMap['Esteticista'], st: statusMap.concluido, dt: formatData(-1, 10) },
      { c: cliIds[1], s: servMap['Manicure Gel'], f: profMap['Manicure'], st: statusMap.confirmado, dt: formatData(0, 9) },
      { c: cliIds[2], s: servMap['Corte de Cabelo Masculino'], f: profMap['Barbeiro'], st: statusMap.confirmado, dt: formatData(1, 14) }
    ];

    for (const t of testes) {
      await client.query(
        `INSERT INTO agendamento (cliente_id, servico_id, funcionario_id, status_id, data_hora_inicio, data_hora_fim, criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, $5::timestamp + interval '1 hour', NOW(), NOW())`,
        [t.c, t.s, t.f, t.st, t.dt]
      );
    }

    console.log("✅ SEED EXECUTADO COM SUCESSO!");
    console.log("--------------------------------------------------");
    console.log("LOGINS DISPONÍVEIS (Senha: teste123):");
    console.log("Admin: admin@maddietavares.cv");
    console.log("Esteticista: cristainny@maddietavares.cv");
    console.log("Cliente: maria@gmail.com");
    console.log("--------------------------------------------------");

  } catch (e) {
    console.error("❌ ERRO NO SEED:", e.stack);
  } finally {
    client.release();
  }
};

export default seed;