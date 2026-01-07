CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  apelido VARCHAR(100) NOT NULL,
  numero_telefone VARCHAR(20) UNIQUE NOT NULL,
  data_nascimento DATE,
  email VARCHAR(100) UNIQUE NOT NULL,
  palavra_passe TEXT NOT NULL,
  email_verificado BOOLEAN DEFAULT FALSE,
  telefone_verificado BOOLEAN DEFAULT FALSE
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cliente (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES usuario(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES usuario(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE funcionario (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES usuario(id),
  funcao_especialidade VARCHAR(100),
  disponibilidade_semanal TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE servico (
  id SERIAL PRIMARY KEY,
  nome_servico VARCHAR(100) NOT NULL,
  duracao_minutos INT CHECK (duracao_minutos > 0),
  preco NUMERIC(10,2) CHECK (preco >= 0),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE servico_funcionario (
  id SERIAL PRIMARY KEY,
  servico_id INT REFERENCES servico(id),
  funcionario_id INT REFERENCES funcionario(id),
  habilitado BOOLEAN DEFAULT TRUE,
  UNIQUE(servico_id, funcionario_id)
);

CREATE TABLE agendamento (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES cliente(id),
  servico_id INT REFERENCES servico(id),
  funcionario_id INT REFERENCES funcionario(id),
  data_hora_inicio TIMESTAMP NOT NULL,
  data_hora_fim TIMESTAMP NOT NULL,
  status VARCHAR(20) CHECK (status IN ('confirmado','cancelado','reagendado')),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  UNIQUE(funcionario_id, data_hora_inicio)
);
"utilizei npm install pg"