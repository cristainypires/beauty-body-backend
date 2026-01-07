import { z } from "zod";

export const userSchema = z.object({
  nome: z.string().min(2),
  apelido: z.string().min(2),
  email: z.string().email(),
  numero_telefone: z.string().min(7),
  palavra_passe: z.string().min(6),
});
