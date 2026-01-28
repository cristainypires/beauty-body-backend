import bcrypt from "bcryptjs";
import pool from "../database/index.js"; // Aqui 'pool' é uma instância do Sequelize
import { gerarToken } from "../utils/Jwt.js";

export async function login(req, res) {
  const { email, password, palavra_passe } = req.body;
  const senha = password || palavra_passe;

  try {
    // 1. Buscar usuário na tabela 'usuario'
    // No Sequelize, usamos { bind: [valor] } para preencher o $1
    const usuarios = await pool.query(
      "SELECT id, nome, email, palavra_passe, usuario_tipo FROM usuario WHERE email = $1",
      {
        bind: [email],
        type: pool.QueryTypes.SELECT, // Indica que é uma consulta de seleção
      }
    );

    // O Sequelize retorna um array de objetos diretamente em SELECT
    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const usuario = usuarios[0];

    // 2. Validar a senha criptografada
    const senhaOk = bcrypt.compareSync(senha, usuario.palavra_passe);

    if (!senhaOk) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // 3. Resolver a Role (Papel)
    let role = usuario.usuario_tipo;

    if (role === "funcionario") {
      const funcionarios = await pool.query(
        "SELECT tipo FROM funcionario WHERE usuario_id = $1",
        {
          bind: [usuario.id],
          type: pool.QueryTypes.SELECT,
        }
      );

      if (funcionarios.length > 0 && funcionarios[0].tipo === "profissional") {
        role = "profissional";
      }
    }

    // 4. Buscar o ID do perfil específico
    let perfil_id = null;
    
    if (role === "admin") {
      const admins = await pool.query(
        "SELECT id FROM admin WHERE usuario_id = $1",
        { bind: [usuario.id], type: pool.QueryTypes.SELECT }
      );
      perfil_id = admins[0]?.id;
    } 
    else if (role === "funcionario" || role === "profissional") {
      const funcs = await pool.query(
        "SELECT id FROM funcionario WHERE usuario_id = $1",
        { bind: [usuario.id], type: pool.QueryTypes.SELECT }
      );
      perfil_id = funcs[0]?.id;
    } 
    else if (role === "cliente") {
      const clientes = await pool.query(
        "SELECT id FROM cliente WHERE usuario_id = $1",
        { bind: [usuario.id], type: pool.QueryTypes.SELECT }
      );
      perfil_id = clientes[0]?.id;
    }

    // 5. Gerar Token JWT
    const token = gerarToken({
      id: usuario.id,
      perfil_id: perfil_id,
      role: role,
    });

    // 6. Resposta
    return res.json({
      token,
      role,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (err) {
    console.error("Erro no Login:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}