import bcrypt from "bcryptjs";
import pool from "../database/index.js"; 
import { gerarToken } from "../utils/Jwt.js";
import { QueryTypes } from "sequelize";

// --- LOGIN ---
export async function login(req, res) {
  const { email, password, palavra_passe } = req.body;
  const senha = password || palavra_passe;

  // 1. Validação de dados de entrada
  if (!email || !senha) {
    return res.status(400).json({ 
      message: "Dados inseridos incorretamente. Certifique-se de preencher e-mail e senha." 
    });
  }

  try {
    const usuarios = await pool.query(
      "SELECT id, nome, email, palavra_passe, usuario_tipo FROM usuario WHERE email = :email",
      {
        replacements: { email: email },
        type: QueryTypes.SELECT,
      }
    );

    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ message: "Usuário não encontrado ou e-mail incorreto." });
    }

    const usuario = usuarios[0];

    const senhaOk = bcrypt.compareSync(senha, usuario.palavra_passe);
    if (!senhaOk) {
      return res.status(401).json({ message: "Senha incorreta. Tente novamente." });
    }

    let role = usuario.usuario_tipo;

    if (role === "funcionario") {
      const funcs = await pool.query(
        "SELECT tipo FROM funcionario WHERE usuario_id = :id",
        { replacements: { id: usuario.id }, type: QueryTypes.SELECT }
      );
      if (funcs.length > 0 && funcs[0].tipo === "profissional") {
        role = "profissional";
      }
    }

    let perfil_id = null;
    let queryPerfil = "";
    if (role === "admin") queryPerfil = "SELECT id FROM admin WHERE usuario_id = :id";
    else if (role === "funcionario" || role === "profissional") queryPerfil = "SELECT id FROM funcionario WHERE usuario_id = :id";
    else if (role === "cliente") queryPerfil = "SELECT id FROM cliente WHERE usuario_id = :id";

    if (queryPerfil) {
      const resPerfil = await pool.query(queryPerfil, {
        replacements: { id: usuario.id },
        type: QueryTypes.SELECT,
      });
      perfil_id = resPerfil[0]?.id || null;
    }

    const token = gerarToken({ id: usuario.id, perfil_id, role });

    return res.json({
      token,
      role,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (err) {
    console.error("Erro no Login:", err);
    return res.status(500).json({ message: "Erro interno no servidor ao tentar logar." });
  }
}

// --- REGISTRO ---
export async function registro(req, res) {
  const { nome, email, password, palavra_passe, usuario_tipo, telefone } = req.body;
  const senha = password || palavra_passe;

  // 1. Validação de campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({ 
      message: "Erro: Os campos Nome, E-mail e Senha são obrigatórios e foram preenchidos incorretamente." 
    });
  }

  // Validação simples de formato de e-mail
  if (!email.includes("@")) {
    return res.status(400).json({ message: "O formato do e-mail inserido é inválido." });
  }

  const t = await pool.transaction();

  try {
    // 2. Verificar se o e-mail já existe
    const existe = await pool.query(
      "SELECT id FROM usuario WHERE email = :email",
      { replacements: { email }, type: QueryTypes.SELECT, transaction: t }
    );

    if (existe && existe.length > 0) {
      await t.rollback();
      return res.status(400).json({ message: "Este e-mail já está cadastrado no sistema." });
    }

    const salt = bcrypt.genSaltSync(10);
    const senhaHash = bcrypt.hashSync(senha, salt);

    // 3. Inserir na tabela 'usuario'
    const resultados = await pool.query(
      "INSERT INTO usuario (nome, email, palavra_passe, usuario_tipo) VALUES (:nome, :email, :senha, :tipo) RETURNING id",
      {
        replacements: { 
            nome, 
            email, 
            senha: senhaHash, 
            tipo: usuario_tipo || "cliente" 
        },
        type: QueryTypes.SELECT, 
        transaction: t,
      }
    );

    if (!resultados || resultados.length === 0) {
        throw new Error("Falha ao obter ID do usuário inserido.");
    }

    const usuario_id = resultados[0].id;
    const tipo = usuario_tipo || "cliente";

    // 4. Inserir na tabela de perfil específica
    try {
        if (tipo === "cliente") {
          await pool.query(
            "INSERT INTO cliente (usuario_id, telefone) VALUES (:uid, :tel)",
            { replacements: { uid: usuario_id, tel: telefone || null }, type: QueryTypes.INSERT, transaction: t }
          );
        } else if (tipo === "funcionario") {
          await pool.query(
            "INSERT INTO funcionario (usuario_id, tipo) VALUES (:uid, :tipo_func)",
            { replacements: { uid: usuario_id, tipo_func: "atendente" }, type: QueryTypes.INSERT, transaction: t }
          );
        } else if (tipo === "admin") {
          await pool.query(
            "INSERT INTO admin (usuario_id) VALUES (:uid)",
            { replacements: { uid: usuario_id }, type: QueryTypes.INSERT, transaction: t }
          );
        }
    } catch (perfilErr) {
        await t.rollback();
        return res.status(400).json({ message: "Erro nos dados do perfil. Verifique se o telefone ou tipo de usuário estão corretos." });
    }

    await t.commit();
    return res.status(201).json({ message: "Usuário registrado com sucesso!" });

  } catch (err) {
    if (t) await t.rollback();
    console.error("Erro no Registro:", err);
    
    // Caso ocorra algum erro de banco (ex: valor muito longo, tipo de dado errado)
    return res.status(500).json({ 
      message: "Erro ao processar os dados. Verifique se as informações inseridas são válidas." 
    });
  }
}