import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query, pool } from "./db/index.js";
import { userSchema } from "./validators/user.schema.js";
import { appointmentSchema } from "./validators/appointment.schema.js";
import { serviceSchema } from "./validators/service.schema.js";
import { verificarConflitoHorario, validarCancelamento } from "./utils/dateRules.js";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "sua-chave-secreta-mudar-em-producao";

app.use(cors());
app.use(express.json());

// ============ MIDDLEWARE DE AUTENTICAÇÃO ============
const autenticar = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (erro) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// ============ ROTAS PÚBLICAS ============
app.get("/", (req, res) => {
  res.json({ message: "Beauty Body API está online 🚀" });
});

// ============ AUTENTICAÇÃO E UTILIZADORES ============
app.post("/auth/registrar", async (req, res) => {
  try {
    const dados = userSchema.safeParse(req.body);
    if (!dados.success) {
      return res.status(400).json({ error: dados.error.errors });
    }

    const { nome, apelido, email, numero_telefone, palavra_passe } = dados.data;

    const resultado = await query(
      `INSERT INTO usuario (nome, apelido, numero_telefone, email, palavra_passe)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email`,
      [nome, apelido, numero_telefone, email, palavra_passe]
    );

    const usuario = resultado.rows[0];
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ usuario, token });
  } catch (erro) {
    console.error(erro);
    if (erro.code === "23505") {
      return res.status(400).json({ error: "Email ou telefone já existe" });
    }
    res.status(500).json({ error: "Erro ao registrar" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, palavra_passe } = req.body;

    const resultado = await query(
      "SELECT id, nome, email FROM usuario WHERE email = $1 AND palavra_passe = $2",
      [email, palavra_passe]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const usuario = resultado.rows[0];
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ usuario, token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

// ============ CLIENTES - CRUD ============
app.post("/clientes", autenticar, async (req, res) => {
  try {
    const resultado = await query(
      "INSERT INTO cliente (usuario_id) VALUES ($1) RETURNING *",
      [req.usuario.id]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
});

app.get("/clientes", autenticar, async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM cliente");
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao listar clientes" });
  }
});

app.get("/clientes/:id", autenticar, async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM cliente WHERE id = $1", [
      req.params.id,
    ]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao obter cliente" });
  }
});

// ============ SERVIÇOS - CRUD ============
app.post("/servicos", autenticar, async (req, res) => {
  try {
    const dados = serviceSchema.safeParse(req.body);
    if (!dados.success) {
      return res.status(400).json({ error: dados.error.errors });
    }

    const { nome_servico, duracao_minutos, preco } = dados.data;
    const resultado = await query(
      `INSERT INTO servico (nome_servico, duracao_minutos, preco)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome_servico, duracao_minutos, preco]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao criar serviço" });
  }
});

app.get("/servicos", async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM servico WHERE ativo = true");
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao listar serviços" });
  }
});

app.get("/servicos/:id", async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM servico WHERE id = $1", [
      req.params.id,
    ]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao obter serviço" });
  }
});

app.put("/servicos/:id", autenticar, async (req, res) => {
  try {
    const dados = serviceSchema.safeParse(req.body);
    if (!dados.success) {
      return res.status(400).json({ error: dados.error.errors });
    }

    const { nome_servico, duracao_minutos, preco } = dados.data;
    const resultado = await query(
      `UPDATE servico SET nome_servico = $1, duracao_minutos = $2, preco = $3
       WHERE id = $4
       RETURNING *`,
      [nome_servico, duracao_minutos, preco, req.params.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao atualizar serviço" });
  }
});

// ============ FUNCIONÁRIOS - CRUD ============
app.post("/funcionarios", autenticar, async (req, res) => {
  try {
    const { usuario_id, funcao_especialidade, disponibilidade_semanal } = req.body;

    const resultado = await query(
      `INSERT INTO funcionario (usuario_id, funcao_especialidade, disponibilidade_semanal)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [usuario_id, funcao_especialidade, disponibilidade_semanal]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao criar funcionário" });
  }
});

app.get("/funcionarios", async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM funcionario WHERE ativo = true");
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao listar funcionários" });
  }
});

app.get("/funcionarios/:id", async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM funcionario WHERE id = $1", [
      req.params.id,
    ]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao obter funcionário" });
  }
});

app.put("/funcionarios/:id", autenticar, async (req, res) => {
  try {
    const { funcao_especialidade, disponibilidade_semanal, ativo } = req.body;

    const resultado = await query(
      `UPDATE funcionario 
       SET funcao_especialidade = COALESCE($1, funcao_especialidade),
           disponibilidade_semanal = COALESCE($2, disponibilidade_semanal),
           ativo = COALESCE($3, ativo)
       WHERE id = $4
       RETURNING *`,
      [funcao_especialidade, disponibilidade_semanal, ativo, req.params.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao atualizar funcionário" });
  }
});

// ============ AGENDAMENTOS ============
app.post("/agendamentos", autenticar, async (req, res) => {
  try {
    const dados = appointmentSchema.safeParse(req.body);
    if (!dados.success) {
      return res.status(400).json({ error: dados.error.errors });
    }

    const { cliente_id, servico_id, funcionario_id, data_hora_inicio } = dados.data;

    const conflito = await verificarConflitoHorario(funcionario_id, data_hora_inicio);
    if (conflito) {
      return res.status(400).json({ error: "Horário indisponível" });
    }

    // Obter duração do serviço
    const servicoResult = await query(
      "SELECT duracao_minutos FROM servico WHERE id = $1",
      [servico_id]
    );

    if (servicoResult.rows.length === 0) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    const duracao = servicoResult.rows[0].duracao_minutos;
    const data_hora_fim = new Date(
      new Date(data_hora_inicio).getTime() + duracao * 60000
    );

    const resultado = await query(
      `INSERT INTO agendamento (cliente_id, servico_id, funcionario_id, data_hora_inicio, data_hora_fim, status)
       VALUES ($1, $2, $3, $4, $5, 'confirmado')
       RETURNING *`,
      [cliente_id, servico_id, funcionario_id, data_hora_inicio, data_hora_fim]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
});

app.get("/agendamentos", autenticar, async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM agendamento ORDER BY data_hora_inicio");
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao listar agendamentos" });
  }
});

app.get("/agendamentos/:id", autenticar, async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM agendamento WHERE id = $1", [
      req.params.id,
    ]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao obter agendamento" });
  }
});

app.put("/agendamentos/:id", autenticar, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmado", "cancelado", "reagendado"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const resultado = await query(
      "UPDATE agendamento SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ error: "Erro ao atualizar agendamento" });
  }
});

// ============ INICIAR SERVIDOR ============
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
