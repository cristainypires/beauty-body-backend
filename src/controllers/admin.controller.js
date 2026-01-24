import { query } from "../database/index.js";
import bcrypt from "bcryptjs";
import { Promocao } from "../models/index.js";

const admin_Controller = {
  // ==========================================
  // 1. GERENCIAR SERVIÇOS
  // ==========================================
  async listar_servicos(req, res) {
    try {
      const result = await query(
        "SELECT * FROM servico ORDER BY nome_servico ASC",
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao listar serviços" });
    }
  },

  async criar_servico(req, res) {
    try {
      const { nome_servico, duracao_minutos, preco } = req.body;
      const result = await query(
        "INSERT INTO servico (nome_servico, duracao_minutos, preco) VALUES ($1, $2, $3) RETURNING *",
        [nome_servico, duracao_minutos, preco],
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao criar serviço" });
    }
  },

  async atualizar_servico(req, res) {
    try {
      const { servico_id } = req.params;
      const { nome_servico, duracao_minutos, preco, ativo } = req.body;
      const result = await query(
        "UPDATE servico SET nome_servico=$1, duracao_minutos=$2, preco=$3, ativo=$4, atualizado_em=NOW() WHERE id=$5 RETURNING *",
        [nome_servico, duracao_minutos, preco, ativo, servico_id],
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao atualizar serviço" });
    }
  },

  async remover_servico(req, res) {
    try {
      const { servico_id } = req.params;
      await query("UPDATE servico SET ativo=false WHERE id=$1", [servico_id]);
      res.json({ mensagem: "Serviço desativado com sucesso" });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao remover serviço" });
    }
  },

  // ==========================================
  // 2. GERENCIAR FUNCIONÁRIOS (Usuario + Funcionario)
  // ==========================================
  async listar_funcionarios(req, res) {
    try {
      const result = await query(`
        SELECT f.id, u.nome, u.apelido, u.email, u.numero_telefone, u.data_nascimento,
               f.funcao_especialidade, f.tipo, f.ativo
        FROM funcionario f
        JOIN usuario u ON f.usuario_id = u.id
        ORDER BY u.nome ASC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao listar funcionários" });
    }
  },

  async criar_funcionario(req, res) {
    try {
      const {
        nome,
        apelido,
        email,
        numero_telefone,
        palavra_passe,
        funcao_especialidade,
        tipo,
      } = req.body;
      const hash = bcrypt.hashSync(palavra_passe, 10);

      // Inserção em duas tabelas (Ideal usar Transaction no Pool se possível)
      const userRes = await query(
        "INSERT INTO usuario (nome, apelido, email, numero_telefone, palavra_passe, usuario_tipo) VALUES ($1, $2, $3, $4, $5, 'funcionario') RETURNING id",
        [nome, apelido, email, numero_telefone, hash],
      );

      const funcRes = await query(
        "INSERT INTO funcionario (usuario_id, funcao_especialidade, tipo) VALUES ($1, $2, $3) RETURNING *",
        [userRes.rows[0].id, funcao_especialidade, tipo || "funcionario"],
      );

      res.status(201).json(funcRes.rows[0]);
    } catch (error) {
      res.status(500).json({
        erro: "Erro ao criar funcionário (Email ou Telefone duplicado)",
      });
    }
  },

  async atualizar_funcionario(req, res) {
    try {
      const { funcionario_id } = req.params;
      const { nome, apelido, funcao_especialidade, ativo } = req.body;

      const func = await query(
        "SELECT usuario_id FROM funcionario WHERE id=$1",
        [funcionario_id],
      );

      await query("UPDATE usuario SET nome=$1, apelido=$2 WHERE id=$3", [
        nome,
        apelido,
        func.rows[0].usuario_id,
      ]);
      await query(
        "UPDATE funcionario SET funcao_especialidade=$1, ativo=$2 WHERE id=$3",
        [funcao_especialidade, ativo, funcionario_id],
      );

      res.json({ mensagem: "Funcionário atualizado" });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao atualizar funcionário" });
    }
  },

  async remover_funcionario(req, res) {
    try {
      const { id } = req.params;
      const result = await query(
        "SELECT usuario_id FROM funcionario WHERE id=$1",
        [id],
      );

      if (!result.rows.length) {
        return res.status(404).json({ erro: "Funcionário não encontrado" });
      }

      await query("UPDATE funcionario SET ativo=false WHERE id=$1", [id]);
      res.json({ mensagem: "Funcionário removido com sucesso" });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao remover funcionário" });
    }
  },

  // ==========================================
  // 3. GERENCIAR CLIENTES
  // ==========================================
  async listar_clientes(req, res) {
    try {
      const result = await query(`
        SELECT c.id, u.nome, u.apelido, u.email, u.numero_telefone, u.criado_em, u.email_verificado as ativo
        FROM cliente c
        JOIN usuario u ON c.usuario_id = u.id
        ORDER BY u.nome ASC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao listar clientes" });
    }
  },

  async desativar_cliente(req, res) {
    try {
      const { id } = req.params;
      const cli = await query("SELECT usuario_id FROM cliente WHERE id=$1", [
        id,
      ]);

      if (!cli.rows.length) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      await query("UPDATE usuario SET email_verificado=false WHERE id=$1", [
        cli.rows[0].usuario_id,
      ]);
      res.json({ mensagem: "Cliente desativado" });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao desativar cliente" });
    }
  },

  async ativar_cliente(req, res) {
    try {
      const { id } = req.params;
      const cli = await query("SELECT usuario_id FROM cliente WHERE id=$1", [
        id,
      ]);

      if (!cli.rows.length) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      await query("UPDATE usuario SET email_verificado=true WHERE id=$1", [
        cli.rows[0].usuario_id,
      ]);
      res.json({ mensagem: "Cliente ativado" });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao ativar cliente" });
    }
  },

  // ==========================================
  // 4. GERENCIAR AGENDAMENTOS (Crucial para o Dashboard)
  // ==========================================
  async listar_agendamentos(req, res) {
    try {
      const result = await query(`
        SELECT 
          a.id, u_cli.nome as cliente_nome, u_cli.numero_telefone as cliente_telefone,
          s.nome_servico, s.preco, u_func.nome as funcionario_nome,
          a.data_hora_inicio, sa.nome as status
        FROM agendamento a
        JOIN cliente c ON a.cliente_id = c.id
        JOIN usuario u_cli ON c.usuario_id = u_cli.id
        JOIN funcionario f ON a.funcionario_id = f.id
        JOIN usuario u_func ON f.usuario_id = u_func.id
        JOIN servico s ON a.servico_id = s.id
        JOIN status_agendamento sa ON a.status_id = sa.id
        ORDER BY a.data_hora_inicio DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao listar agendamentos" });
    }
  },

  async cancelar_agendamento(req, res) {
    try {
      const status = await query(
        "SELECT id FROM status_agendamento WHERE nome='cancelado'",
      );
      await query("UPDATE agendamento SET status_id=$1 WHERE id=$2", [
        status.rows[0].id,
        req.params.agendamento_id,
      ]);
      res.json({ mensagem: "Cancelado" });
    } catch (error) {
      res.status(500).json({ erro: "Erro" });
    }
  },

  // ==========================================
  // 5. RELATÓRIOS E LOGS
  // ==========================================
  async relatorio_financeiro(req, res) {
    try {
      const result = await query(`
        SELECT COALESCE(SUM(valor), 0) as total_receita 
        FROM pagamento WHERE status = 'pago'
      `);
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ erro: "Erro financeiro" });
    }
  },

  async visualizar_logs(req, res) {
    try {
      const result = await query(`
        SELECT l.id, l.criado_em as data_hora, l.descricao as acao, u.nome as usuario_nome
        FROM auditoria_logs l
        JOIN usuario u ON l.usuario_id = u.id
        ORDER BY l.criado_em DESC LIMIT 100
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ erro: "Erro logs" });
    }
  },

  // ==========================================
  // 6. REAGENDAR AGENDAMENTO
  // ==========================================
  async reagendar_agendamento(req, res) {
    try {
      const { id } = req.params;
      const { data_hora_inicio } = req.body;

      const result = await query(
        "UPDATE agendamento SET data_hora_inicio=$1, atualizado_em=NOW() WHERE id=$2 RETURNING *",
        [data_hora_inicio, id],
      );

      if (!result.rows.length) {
        return res.status(404).json({ erro: "Agendamento não encontrado" });
      }

      res.json({
        mensagem: "Agendamento reagendado com sucesso",
        agendamento: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao reagendar agendamento" });
    }
  },

  // ==========================================
  // 7. GERENCIAR PROMOÇÕES
  // ==========================================
  async listar_promocoes(req, res) {
    try {
      const promocoes = await Promocao.findAll({
        order: [["nome", "ASC"]],
      });

      // Formata datas para evitar 'Invalid Date' no front
      const promocoesFormatadas = promocoes.map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        tipo: p.tipo,
        valor: p.valor,
       data_inicio: p.data_inicio
  ? new Date(p.data_inicio).toISOString().split("T")[0]
  : null,
data_fim: p.data_fim
  ? new Date(p.data_fim).toISOString().split("T")[0]
  : null,

        ativo: p.ativo,
      }));

      res.json(promocoesFormatadas);
    } catch (error) {
      console.error("[ERRO LISTAR PROMOÇÕES]", error);
      res.status(500).json({ erro: error.message });
    }
  },

  async criar_promocao(req, res) {
    try {
      const { nome, descricao, tipo, valor, data_inicio, data_fim } = req.body;

      // Validação simples
      if (!nome || !tipo || !valor || !data_inicio || !data_fim) {
        return res
          .status(400)
          .json({ erro: "Todos os campos obrigatórios devem ser preenchidos" });
      }

      const promocao = await Promocao.create({
        nome,
        descricao,
        tipo,
        valor,
        data_inicio,
        data_fim,
        ativo: true,
      });

      res.status(201).json(promocao);
    } catch (error) {
      console.error("[ERRO CRIAR PROMOÇÃO]", error);
      res.status(500).json({ erro: error.message });
    }
  },
  async atualizar_promocao(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, tipo, valor, data_inicio, data_fim, ativo } =
        req.body;

      const result = await query(
        `UPDATE promocao SET nome=$1, descricao=$2, tipo=$3, valor=$4, 
                data_inicio=$5, data_fim=$6, ativo=$7 WHERE id=$8 RETURNING *`,
        [nome, descricao, tipo, valor, data_inicio, data_fim, ativo, id],
      );

      if (!result.rows.length) {
        return res.status(404).json({ erro: "Promoção não encontrada" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("[ERRO ATUALIZAR PROMOÇÃO]", error.message);
      res.status(500).json({ erro: error.message });
    }
  },
};

export default admin_Controller;
