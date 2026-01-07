import dotenv from "dotenv";
dotenv.config();

import { query } from "../db/index.js";

// Insere ou obtém o utilizador admin (id será usado para a tabela admin)
const resUser = await query(`
  INSERT INTO usuario (nome, apelido, numero_telefone, email, palavra_passe, email_verificado)
  VALUES ('Admin','Sistema','900000000','admin@sistema.cv','admin123',true)
  ON CONFLICT (numero_telefone) DO UPDATE
    SET nome = EXCLUDED.nome,
        apelido = EXCLUDED.apelido,
        email = EXCLUDED.email,
        palavra_passe = EXCLUDED.palavra_passe
  RETURNING id
`);

const usuarioId = resUser.rows[0].id;

// Insere admin apenas se não existir para este usuario_id
await query(`
  INSERT INTO admin (usuario_id)
  VALUES ($1)
  ON CONFLICT DO NOTHING
`, [usuarioId]);

// Insere serviços de forma idempotente
await query(`
  INSERT INTO servico (nome_servico, duracao_minutos, preco)
  VALUES 
    ('Limpeza de Pele', 60, 2500),
    ('Manicure', 45, 1500)
  ON CONFLICT DO NOTHING
`);
