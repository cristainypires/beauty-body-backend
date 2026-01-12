-- =========================
-- LIMPEZA (opcional)
-- =========================
DROP TABLE IF EXISTS notificacao CASCADE;
DROP TABLE IF EXISTS lembrete CASCADE;
DROP TABLE IF EXISTS pagamento CASCADE;
DROP TABLE IF EXISTS promocao_servico CASCADE;
DROP TABLE IF EXISTS promocao CASCADE;
DROP TABLE IF EXISTS agendamento CASCADE;
DROP TABLE IF EXISTS status_agendamento CASCADE;
DROP TABLE IF EXISTS servico_funcionario CASCADE;
DROP TABLE IF EXISTS agenda_funcionario CASCADE;
DROP TABLE IF EXISTS servico CASCADE;
DROP TABLE IF EXISTS funcionario CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

-- =========================
-- USUÁRIO
-- =========================
CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  apelido VARCHAR(100) NOT NULL,
  numero_telefone VARCHAR(20) UNIQUE NOT NULL,
  data_nascimento DATE,
  email VARCHAR(100) UNIQUE NOT NULL,
  palavra_passe TEXT NOT NULL,
  email_verificado BOOLEAN DEFAULT FALSE,
  telefone_verificado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- CLIENTE
-- =========================
CREATE TABLE cliente (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- ADMIN
-- =========================
CREATE TABLE admin (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- FUNCIONÁRIO
-- =========================
CREATE TABLE funcionario (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  funcao_especialidade VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- AGENDA DO FUNCIONÁRIO
-- =========================
CREATE TABLE agenda_funcionario (
  id SERIAL PRIMARY KEY,
  funcionario_id INT REFERENCES funcionario(id) ON DELETE CASCADE,
  dia_semana INT CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  disponivel BOOLEAN DEFAULT TRUE
);

-- =========================
-- SERVIÇO
-- =========================
CREATE TABLE servico (
  id SERIAL PRIMARY KEY,
  nome_servico VARCHAR(100) NOT NULL,
  duracao_minutos INT CHECK (duracao_minutos > 0),
  preco NUMERIC(10,2) CHECK (preco >= 0),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- SERVIÇO ⇄ FUNCIONÁRIO
-- =========================
CREATE TABLE servico_funcionario (
  id SERIAL PRIMARY KEY,
  servico_id INT REFERENCES servico(id) ON DELETE CASCADE,
  funcionario_id INT REFERENCES funcionario(id) ON DELETE CASCADE,
  habilitado BOOLEAN DEFAULT TRUE,
  UNIQUE (servico_id, funcionario_id)
);

-- =========================
-- STATUS DE AGENDAMENTO
-- =========================
CREATE TABLE status_agendamento (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(30) UNIQUE NOT NULL
);

INSERT INTO status_agendamento (nome)
VALUES ('pendente'), ('confirmado'), ('cancelado'), ('reagendado');

-- =========================
-- AGENDAMENTO
-- =========================
CREATE TABLE agendamento (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES cliente(id) ON DELETE SET NULL,
  servico_id INT REFERENCES servico(id),
  funcionario_id INT REFERENCES funcionario(id),
  status_id INT REFERENCES status_agendamento(id),
  data_hora_inicio TIMESTAMP NOT NULL,
  data_hora_fim TIMESTAMP NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  UNIQUE (funcionario_id, data_hora_inicio)
);

-- =========================
-- PAGAMENTO
-- =========================
CREATE TABLE pagamento (
  id SERIAL PRIMARY KEY,
  agendamento_id INT UNIQUE REFERENCES agendamento(id) ON DELETE CASCADE,
  metodo VARCHAR(30),
  valor NUMERIC(10,2),
  moeda VARCHAR(10),
  status VARCHAR(30),
  referencia_externa VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- PROMOÇÃO
-- =========================
CREATE TABLE promocao (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(20) CHECK (tipo IN ('percentual', 'fixo')),
  valor NUMERIC(10,2) CHECK (valor > 0),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- PROMOÇÃO ⇄ SERVIÇO
-- =========================
CREATE TABLE promocao_servico (
  id SERIAL PRIMARY KEY,
  promocao_id INT REFERENCES promocao(id) ON DELETE CASCADE,
  servico_id INT REFERENCES servico(id) ON DELETE CASCADE,
  UNIQUE (promocao_id, servico_id)
);

-- =========================
-- LEMBRETE
-- =========================
CREATE TABLE lembrete (
  id SERIAL PRIMARY KEY,
  agendamento_id INT REFERENCES agendamento(id) ON DELETE CASCADE,
  status VARCHAR(30),
  enviar_em TIMESTAMP,
  canal VARCHAR(30)
);

-- =========================
-- NOTIFICAÇÃO
-- =========================
CREATE TABLE notificacao (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50),
  data_hora TIMESTAMP,
  agendamento_id INT REFERENCES agendamento(id),
  usuario_id INT REFERENCES usuario(id),
  canal VARCHAR(30),
  status VARCHAR(30),
  conteudo TEXT
);
