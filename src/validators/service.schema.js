import { z } from "zod";

export const serviceSchema = z.object({
  nome_servico: z.string().min(3),
  duracao_minutos: z.number().positive(),
  preco: z.number().nonnegative(),
});
