import bcrypt from "bcryptjs";
import pool from "../database/index.js"; // Aqui 'pool' é uma instância do Sequelize
import { gerarToken } from "../utils/Jwt.js";
import { Usuario, Cliente, sequelize } from "../models/index.js"; // Importe seus modelos


export async function login(req, res) {
  const { email, password } = req.body;

  try {
    // 1. Busca usuário e já descobre se é Admin ou Funcionário (LEFT JOIN)
    const usuarios = await sequelize.query(
      `SELECT u.id, u.nome, u.email, u.palavra_passe, u.usuario_tipo, 
              f.id AS funcionario_id, a.id AS admin_id
       FROM usuario u
       LEFT JOIN funcionario f ON f.usuario_id = u.id
       LEFT JOIN admin a ON a.usuario_id = u.id
       WHERE LOWER(u.email) = LOWER(:email)`,
      {
        replacements: { email: email.trim() },
        type: sequelize.QueryTypes.SELECT,
        raw: true
      }
    );

    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }

    const usuario = usuarios[0];

    // 2. Compara a senha
    const senhaOk = await bcrypt.compare(password, usuario.palavra_passe);
    if (!senhaOk) {
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }

    // 3. Define qual ID de perfil usar
    const perfilId = usuario.usuario_tipo === 'admin' ? usuario.admin_id : usuario.funcionario_id;

    const token = gerarToken({ 
      id: usuario.id, 
      perfil_id: perfilId, 
      role: usuario.usuario_tipo 
    });

     return res.status(200).json({
      token,
      role: usuario.usuario_tipo,
      usuario: { id: usuario.id, nome: usuario.nome }
    });

  } catch (err) {
    return res.status(500).json({ message: "Erro no servidor." });
  }
}
// ... seus imports (bcryptjs, pool, etc)

export async function registrar(req, res) {
  const { nome, email, telefone, senha } = req.body;

  // Iniciamos uma transação para garantir que ou criamos os dois (User e Cliente) ou não criamos nenhum
  const t = await sequelize.transaction();

  try {
    // 1. Verificar se o e-mail já existe (Usando o Modelo para ser mais limpo)
    const usuarioExistente = await Usuario.findOne({ where: { email } });

    if (usuarioExistente) {
      await t.rollback();
      return res.status(400).json({ message: "Este e-mail já está cadastrado." });
    }
const telefoneExistente = await Usuario.findOne({
  where: { numero_telefone: telefone }
});

if (telefoneExistente) {
  await t.rollback();
  return res.status(400).json({ message: "Este número de telefone já está cadastrado." });
}

    // 2. Criptografar a senha
    const hashSenha = await bcrypt.hash(senha, 10);

    // 3. Criar o Usuário
    const apelido = nome.split(' ')[0];
    
    const novoUsuario = await Usuario.create({
      nome,
      apelido,
      email,
      numero_telefone: telefone,
      palavra_passe: hashSenha,
      usuario_tipo: 'cliente',
      email_verificado: false,
      telefone_verificado: false
    }, { transaction: t });

    // 4. Criar o perfil de Cliente vinculado (O ID já vem automático no objeto novoUsuario)
    await Cliente.create({
      usuario_id: novoUsuario.id,
      criado_em: new Date()
    }, { transaction: t });

    // Se chegou aqui sem erros, confirmamos as duas inserções no banco
    await t.commit();

    return res.status(201).json({ message: "Conta criada com sucesso!" });

  }  catch (err) {

  if (t) await t.rollback();

  console.error("Erro no Registro:", err);

  // 👉 Email duplicado ou telefone duplicado
  if (err.name === "SequelizeUniqueConstraintError") {

    const campo = err.errors[0].path;

    if (campo === "email") {
      return res.status(400).json({ message: "Este e-mail já está cadastrado." });
    }

    if (campo === "numero_telefone") {
      return res.status(400).json({ message: "Este número de telefone já está cadastrado." });
    }

    return res.status(400).json({ message: "Dados já existentes no sistema." });
  }

  // 👉 Erros de validação (campo vazio, formato errado etc)
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: err.errors[0].message
    });
  }

  // 👉 Erro genérico
  return res.status(500).json({ 
    message: "Erro interno ao processar cadastro." 
  });

}}