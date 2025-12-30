import jwt from "jsonwebtoken";

export function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      role: usuario.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}
