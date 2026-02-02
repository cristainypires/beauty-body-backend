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
  // 1. Log para sabermos o que o Dashboard enviou
  console.log("==> Dados recebidos no Registro:", req.body);

  const { nome, email, password, palavra_passe, telefone, usuario_tipo } = req.body;
  const senha = password || palavra_passe;

  // 2. Validação básica
  if (!nome || !email || !senha || !telefone) {
    return res.status(400).json({ 
      message: "Campos obrigatórios: Nome, E-mail, Senha e Telefone." 
    });
  }

  // Iniciar uma transação (ou tudo salva ou nada salva)
  const t = await sequelize.transaction();

  try {
    // 3. Verificar se e-mail já existe
    const existe = await Usuario.findOne({ where: { email }, transaction: t });
    if (existe) {
      await t.rollback();
      return res.status(400).json({ message: "Este e-mail já está cadastrado." });
    }

    // 4. Criptografar Senha
    const senhaHash = bcrypt.hashSync(senha, 10);

    // 5. Criar o USUARIO (Campos obrigatórios do seu banco)
    const novoUsuario = await Usuario.create({
      nome,
      apelido: nome.split(' ')[0], // Gera o apelido automaticamente do nome
      numero_telefone: telefone,
      email,
      palavra_passe: senhaHash,
      usuario_tipo: usuario_tipo || "cliente",
      email_verificado: true,
      telefone_verificado: true
    }, { transaction: t });

    // 6. Criar o PERFIL baseado no tipo
    const tipo = usuario_tipo || "cliente";

    if (tipo === "cliente") {
      await Cliente.create({ 
        usuario_id: novoUsuario.id,
        criado_em: new Date() // Seu banco usa Português aqui
      }, { transaction: t });
    } 
    else if (tipo === "funcionario") {
      await Funcionario.create({ 
        usuario_id: novoUsuario.id, 
        tipo: "atendente", 
        funcao_especialidade: "Geral",
        ativo: true,
        criado_em: new Date() // Seu banco usa Português aqui
      }, { transaction: t });
    }
    else if (tipo === "admin") {
      await Admin.create({ 
        usuario_id: novoUsuario.id,
        created_at: new Date(), // Admin usa Inglês
        updated_at: new Date()
      }, { transaction: t });
    }

    await t.commit();
    console.log("✅ Usuário registrado com sucesso!");
    return res.status(201).json({ message: "Registro concluído com sucesso!" });

  } catch (err) {
    if (t) await t.rollback();
    console.error("❌ Erro detalhado no Registro:", err);
    return res.status(500).json({ 
      message: "Erro no servidor ao registrar.",
      error: err.message 
    });
  }
}