import bcrypt from "bcryptjs";
import pool from "../database/index.js";
import { gerarToken } from "../utils/Jwt.js";

export async function login(req, res) {
  const { email, password, palavra_passe } = req.body;
  const senha = password || palavra_passe; // Aceita ambos os nomes

  try {
    // 1. Buscar usuário na tabela 'usuario'
    const userRes = await pool.query(
      "SELECT id, nome, email, palavra_passe, usuario_tipo FROM usuario WHERE email = $1",
      [email]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const usuario = userRes.rows[0];

    // 2. Validar a senha criptografada
    const senhaOk = bcrypt.compareSync(senha, usuario.palavra_passe);

    if (!senhaOk) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // 3. Resolver a Role (Papel)
    let role = usuario.usuario_tipo;

    if (role === "funcionario") {
      const funcRes = await pool.query(
        "SELECT tipo FROM funcionario WHERE usuario_id = $1",
        [usuario.id]
      );

      if (funcRes.rowCount > 0 && funcRes.rows[0].tipo === "profissional") {
        role = "profissional";
      }
    }

    // 4. Buscar o ID do perfil específico
    let perfil_id = null;
    if (role === "admin") {
      const resAdmin = await pool.query(
        "SELECT id FROM admin WHERE usuario_id = $1",
        [usuario.id]
      );
      perfil_id = resAdmin.rows[0]?.id;
    } else if (role === "funcionario" || role === "profissional") {
      const resFunc = await pool.query(
        "SELECT id FROM funcionario WHERE usuario_id = $1",
        [usuario.id]
      );
      perfil_id = resFunc.rows[0]?.id;
    } else if (role === "cliente") {
      const resCli = await pool.query(
        "SELECT id FROM cliente WHERE usuario_id = $1",
        [usuario.id]
      );
      perfil_id = resCli.rows[0]?.id;
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
