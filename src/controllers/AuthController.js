import bcrypt from "bcryptjs";
import { Usuario } from "../models/index.js"; // Importando do index para pegar as associações
import { Cliente } from "../models/index.js";
import { Funcionario } from "../models/index.js";
import { Admin } from "../models/index.js";
import { gerarToken } from "../utils/Jwt.js";
import { sequelize } from "../models/index.js"; 

// --- LOGIN ---
export async function login(req, res) {
  const { email, password, palavra_passe } = req.body;
  const senha = password || palavra_passe;

  if (!email || !senha) {
    return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
  }

  try {
    // Busca o usuário pelo e-mail usando o Model
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ message: "Usuário não encontrado ou e-mail incorreto." });
    }

    // Compara a senha
    const senhaOk = bcrypt.compareSync(senha, usuario.palavra_passe);
    if (!senhaOk) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    let role = usuario.usuario_tipo;
    let perfil_id = null;

    // Lógica para identificar se é profissional ou buscar o ID do perfil
    if (role === "admin") {
      const adm = await Admin.findOne({ where: { usuario_id: usuario.id } });
      perfil_id = adm?.id;
    } else if (role === "funcionario") {
      const func = await Funcionario.findOne({ where: { usuario_id: usuario.id } });
      perfil_id = func?.id;
      if (func?.tipo === "profissional") role = "profissional";
    } else if (role === "cliente") {
      const cli = await Cliente.findOne({ where: { usuario_id: usuario.id } });
      perfil_id = cli?.id;
    }

    const token = gerarToken({ id: usuario.id, perfil_id, role });

    return res.json({
      token,
      role,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (err) {
    console.error("Erro no Login:", err);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}



export async function registro(req, res) {
  // Adicionei logs para você ver no PM2 o que está chegando
  console.log("Dados recebidos no registro:", req.body);

  const { nome, email, password, palavra_passe, usuario_tipo, telefone } = req.body;
  const senha = password || palavra_passe;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: "Nome, E-mail e Senha são obrigatórios." });
  }

  const t = await sequelize.transaction();

  try {
    const existe = await Usuario.findOne({ where: { email }, transaction: t });
    if (existe) {
      await t.rollback();
      return res.status(400).json({ message: "Este e-mail já está cadastrado." });
    }

    const salt = bcrypt.genSaltSync(10);
    const senhaHash = bcrypt.hashSync(senha, salt);

    // Cria o usuário com os campos que o seu PostgreSQL exige
    const novoUsuario = await Usuario.create({
      nome,
      apelido: nome.split(' ')[0], // Pega o primeiro nome como apelido
      numero_telefone: telefone || '0000000', // Garante que não vá nulo
      email,
      palavra_passe: senhaHash,
      usuario_tipo: usuario_tipo || "cliente",
      email_verificado: true,
      telefone_verificado: true
    }, { transaction: t });

    const tipo = usuario_tipo || "cliente";

    // Cria o perfil específico
    if (tipo === "cliente") {
      await Cliente.create({ 
        usuario_id: novoUsuario.id,
        criado_em: new Date() // Conforme vimos que seu banco pede
      }, { transaction: t });
    } else if (tipo === "funcionario") {
      await Funcionario.create({ 
        usuario_id: novoUsuario.id, 
        tipo: "atendente",
        criado_em: new Date() 
      }, { transaction: t });
    } else if (tipo === "admin") {
      await Admin.create({ 
        usuario_id: novoUsuario.id,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });
    }

    await t.commit();
    console.log("✅ Usuário registrado com sucesso:", email);
    return res.status(201).json({ message: "Usuário registrado com sucesso!" });

  } catch (err) {
    if (t) await t.rollback();
    console.error("❌ Erro detalhado no Registro:", err);
    return res.status(500).json({ message: "Erro ao processar registro: " + err.message });
  }
}