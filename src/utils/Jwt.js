// src/utils/Jwt.js
import jwt from "jsonwebtoken";

export function gerarToken(payload) {
  // Use a mesma chave que o middleware 'autenticar' vai ler
  return jwt.sign(payload, process.env.JWT_SECRET || "maddie_boutique_secret_key_123", {
    expiresIn: "8h",
  });
}