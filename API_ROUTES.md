# Beauty Body Backend - Documentação da API

## 🚀 Base URL
```
http://localhost:3333
```

## 🔐 Autenticação
A maioria das rotas requer autenticação via **JWT Token**.

Após fazer login, use o token no header:
```
Authorization: Bearer <seu_token_jwt>
```

---

## 📋 ROTAS PÚBLICAS

### 1. Health Check
```
GET /
```
**Descrição:** Verifica se a API está online

**Resposta:**
```json
{
  "message": "Beauty Body API está online 🚀"
}
```

---

## 🔑 AUTENTICAÇÃO

### 1. Registrar Novo Utilizador
```
POST /auth/registrar
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "João",
  "apelido": "Silva",
  "email": "joao@email.com",
  "numero_telefone": "912345678",
  "palavra_passe": "senha123"
}
```

**Resposta (201):**
```json
{
  "usuario": {
    "id": 1,
    "nome": "João",
    "email": "joao@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**
- `400`: Email ou telefone já existe
- `400`: Dados inválidos

---

### 2. Login
```
POST /auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "joao@email.com",
  "palavra_passe": "senha123"
}
```

**Resposta (200):**
```json
{
  "usuario": {
    "id": 1,
    "nome": "João",
    "email": "joao@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**
- `401`: Email ou senha inválidos

---

## 👥 CLIENTES

### 1. Criar Cliente
```
POST /clientes
Authorization: Bearer <token>
```

**Resposta (201):**
```json
{
  "id": 1,
  "usuario_id": 1,
  "criado_em": "2026-01-02T10:30:00Z"
}
```

---

### 2. Listar Todos os Clientes
```
GET /clientes
Authorization: Bearer <token>
```

**Resposta (200):**
```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "criado_em": "2026-01-02T10:30:00Z"
  }
]
```

---

### 3. Obter Cliente por ID
```
GET /clientes/:id
Authorization: Bearer <token>
```

**Exemplo:** `GET /clientes/1`

**Resposta (200):**
```json
{
  "id": 1,
  "usuario_id": 1,
  "criado_em": "2026-01-02T10:30:00Z"
}
```

**Erros:**
- `404`: Cliente não encontrado

---

## 🛍️ SERVIÇOS

### 1. Criar Serviço
```
POST /servicos
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nome_servico": "Limpeza de Pele",
  "duracao_minutos": 60,
  "preco": 2500
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "nome_servico": "Limpeza de Pele",
  "duracao_minutos": 60,
  "preco": "2500.00",
  "ativo": true,
  "criado_em": "2026-01-02T10:30:00Z",
  "atualizado_em": "2026-01-02T10:30:00Z"
}
```

---

### 2. Listar Serviços Ativos
```
GET /servicos
```

**Resposta (200):**
```json
[
  {
    "id": 1,
    "nome_servico": "Limpeza de Pele",
    "duracao_minutos": 60,
    "preco": "2500.00",
    "ativo": true,
    "criado_em": "2026-01-02T10:30:00Z",
    "atualizado_em": "2026-01-02T10:30:00Z"
  }
]
```

---

### 3. Obter Serviço por ID
```
GET /servicos/:id
```

**Exemplo:** `GET /servicos/1`

**Resposta (200):**
```json
{
  "id": 1,
  "nome_servico": "Limpeza de Pele",
  "duracao_minutos": 60,
  "preco": "2500.00",
  "ativo": true,
  "criado_em": "2026-01-02T10:30:00Z",
  "atualizado_em": "2026-01-02T10:30:00Z"
}
```

**Erros:**
- `404`: Serviço não encontrado

---

### 4. Atualizar Serviço
```
PUT /servicos/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nome_servico": "Limpeza de Pele Premium",
  "duracao_minutos": 90,
  "preco": 3500
}
```

**Resposta (200):**
```json
{
  "id": 1,
  "nome_servico": "Limpeza de Pele Premium",
  "duracao_minutos": 90,
  "preco": "3500.00",
  "ativo": true,
  "criado_em": "2026-01-02T10:30:00Z",
  "atualizado_em": "2026-01-02T11:00:00Z"
}
```

**Erros:**
- `404`: Serviço não encontrado
- `400`: Dados inválidos

---

## 👨‍💼 FUNCIONÁRIOS

### 1. Criar Funcionário
```
POST /funcionarios
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "usuario_id": 2,
  "funcao_especialidade": "Esteticista",
  "disponibilidade_semanal": "seg-sex 09:00-18:00"
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "usuario_id": 2,
  "funcao_especialidade": "Esteticista",
  "disponibilidade_semanal": "seg-sex 09:00-18:00",
  "ativo": true,
  "criado_em": "2026-01-02T10:30:00Z"
}
```

---

### 2. Listar Funcionários Ativos
```
GET /funcionarios
```

**Resposta (200):**
```json
[
  {
    "id": 1,
    "usuario_id": 2,
    "funcao_especialidade": "Esteticista",
    "disponibilidade_semanal": "seg-sex 09:00-18:00",
    "ativo": true,
    "criado_em": "2026-01-02T10:30:00Z"
  }
]
```

---

### 3. Obter Funcionário por ID
```
GET /funcionarios/:id
```

**Exemplo:** `GET /funcionarios/1`

**Resposta (200):**
```json
{
  "id": 1,
  "usuario_id": 2,
  "funcao_especialidade": "Esteticista",
  "disponibilidade_semanal": "seg-sex 09:00-18:00",
  "ativo": true,
  "criado_em": "2026-01-02T10:30:00Z"
}
```

**Erros:**
- `404`: Funcionário não encontrado

---

### 4. Atualizar Funcionário
```
PUT /funcionarios/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (todos os campos são opcionais):**
```json
{
  "funcao_especialidade": "Esteticista Senior",
  "disponibilidade_semanal": "seg-sex 08:00-20:00",
  "ativo": true
}
```

**Resposta (200):**
```json
{
  "id": 1,
  "usuario_id": 2,
  "funcao_especialidade": "Esteticista Senior",
  "disponibilidade_semanal": "seg-sex 08:00-20:00",
  "ativo": true,
  "criado_em": "2026-01-02T10:30:00Z"
}
```

**Erros:**
- `404`: Funcionário não encontrado

---

## 📅 AGENDAMENTOS

### 1. Criar Agendamento
```
POST /agendamentos
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "cliente_id": 1,
  "servico_id": 1,
  "funcionario_id": 1,
  "data_hora_inicio": "2026-01-15T10:00:00"
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "cliente_id": 1,
  "servico_id": 1,
  "funcionario_id": 1,
  "data_hora_inicio": "2026-01-15T10:00:00Z",
  "data_hora_fim": "2026-01-15T11:00:00Z",
  "status": "confirmado",
  "criado_em": "2026-01-02T10:30:00Z",
  "atualizado_em": "2026-01-02T10:30:00Z"
}
```

**Erros:**
- `400`: Horário indisponível
- `404`: Serviço não encontrado
- `400`: Dados inválidos

---

### 2. Listar Agendamentos
```
GET /agendamentos
Authorization: Bearer <token>
```

**Resposta (200):**
```json
[
  {
    "id": 1,
    "cliente_id": 1,
    "servico_id": 1,
    "funcionario_id": 1,
    "data_hora_inicio": "2026-01-15T10:00:00Z",
    "data_hora_fim": "2026-01-15T11:00:00Z",
    "status": "confirmado",
    "criado_em": "2026-01-02T10:30:00Z",
    "atualizado_em": "2026-01-02T10:30:00Z"
  }
]
```

---

### 3. Obter Agendamento por ID
```
GET /agendamentos/:id
Authorization: Bearer <token>
```

**Exemplo:** `GET /agendamentos/1`

**Resposta (200):**
```json
{
  "id": 1,
  "cliente_id": 1,
  "servico_id": 1,
  "funcionario_id": 1,
  "data_hora_inicio": "2026-01-15T10:00:00Z",
  "data_hora_fim": "2026-01-15T11:00:00Z",
  "status": "confirmado",
  "criado_em": "2026-01-02T10:30:00Z",
  "atualizado_em": "2026-01-02T10:30:00Z"
}
```

**Erros:**
- `404`: Agendamento não encontrado

---

### 4. Atualizar Status do Agendamento
```
PUT /agendamentos/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "cancelado"
}
```

**Status válidos:** `confirmado`, `cancelado`, `reagendado`

**Resposta (200):**
```json
{
  "id": 1,
  "cliente_id": 1,
  "servico_id": 1,
  "funcionario_id": 1,
  "data_hora_inicio": "2026-01-15T10:00:00Z",
  "data_hora_fim": "2026-01-15T11:00:00Z",
  "status": "cancelado",
  "criado_em": "2026-01-02T10:30:00Z",
  "atualizado_em": "2026-01-02T11:00:00Z"
}
```

**Erros:**
- `404`: Agendamento não encontrado
- `400`: Status inválido

---

## 📝 Exemplo Completo de Fluxo

### 1. Registrar utilizador
```bash
curl -X POST http://localhost:3333/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João",
    "apelido": "Silva",
    "email": "joao@email.com",
    "numero_telefone": "912345678",
    "palavra_passe": "senha123"
  }'
```

### 2. Fazer Login (copie o token retornado)
```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "palavra_passe": "senha123"
  }'
```

### 3. Criar Serviço
```bash
curl -X POST http://localhost:3333/servicos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "nome_servico": "Manicure",
    "duracao_minutos": 45,
    "preco": 1500
  }'
```

### 4. Criar Cliente
```bash
curl -X POST http://localhost:3333/clientes \
  -H "Authorization: Bearer <seu_token>"
```

### 5. Criar Funcionário
```bash
curl -X POST http://localhost:3333/funcionarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "usuario_id": 2,
    "funcao_especialidade": "Manicurista",
    "disponibilidade_semanal": "seg-sex 09:00-18:00"
  }'
```

### 6. Criar Agendamento
```bash
curl -X POST http://localhost:3333/agendamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "cliente_id": 1,
    "servico_id": 1,
    "funcionario_id": 1,
    "data_hora_inicio": "2026-01-15T14:00:00"
  }'
```

---

## ⚠️ Códigos de Erro

| Código | Significado |
|--------|------------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `400` | Pedido inválido / Dados incorretos |
| `401` | Não autenticado / Token inválido |
| `404` | Recurso não encontrado |
| `500` | Erro do servidor |

---

## 📌 Notas Importantes

- Todos os tokens expiram em **24 horas**
- A duração do agendamento é calculada automaticamente baseada na duração do serviço
- Não é possível agendar no mesmo horário para um funcionário (validação de conflito)
- Os cancelamentos só são permitidos até **72 horas antes** do agendamento
