import bcrypt from "bcryptjs";
import { gerarToken } from "../utils/Jwt.js";

// MOCK – depois será BD
const usuarios = [
  {
    id: 1,
    email: "admin@email.com",
    password: bcrypt.hashSync("123456", 8),
    role: "admin",
  },
  {
    id: 2,
    email: "cliente@email.com",
    password: bcrypt.hashSync("123456", 8),
    role: "cliente",
  },
  {
    id : 3, 
    email: "funcionario@email.com",
    password: bcrypt.hashSync("123456", 8),
    role: "funcionario",
    
  }
];

export function login(req, res) {
  const { email, password } = req.body;

  const usuario = usuarios.find(u => u.email === email);

  if (!usuario) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const senhaValida = bcrypt.compareSync(password, usuario.password);

  if (!senhaValida) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const token = gerarToken(usuario);

  res.json({
    token,
    role: usuario.role,
  });
}
