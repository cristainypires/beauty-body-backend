import { query } from "../db/index.js";

await query(`
  INSERT INTO usuario (nome, apelido, numero_telefone, email, palavra_passe, email_verificado)
  VALUES ('Admin','Sistema','900000000','admin@sistema.cv','admin123',true)
`);

await query(`
  INSERT INTO admin (usuario_id)
  VALUES (1)
`);

await query(`
  INSERT INTO servico (nome_servico, duracao_minutos, preco)
  VALUES 
    ('Limpeza de Pele', 60, 2500),
    ('Manicure', 45, 1500)
`);
