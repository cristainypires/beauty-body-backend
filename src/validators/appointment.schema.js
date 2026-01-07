import { z } from "zod";

export const appointmentSchema = z.object({
  cliente_id: z.number().int(),
  funcionario_id: z.number().int(),
  servico_id: z.number().int(),
  data_hora_inicio: z.coerce.date(),
});
