import { z } from "zod";

export const loginSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha muito curta").optional(),
    palavra_passe: z.string().min(6, "Senha muito curta").optional(),
  })
  .refine((data) => data.password || data.palavra_passe, {
    message: "Senha é obrigatória",
  });
