// src/utils/dateRules.js

import { query } from "../db/index.js";

/**
 * Regra RF08 – Cancelamento só até 72h antes
 */
export function validarCancelamento(dataAgendamento) {
  const agora = new Date();
  const data = new Date(dataAgendamento);

  const diff = data - agora;

  // 72 horas em milissegundos
  return diff >= 72 * 60 * 60 * 1000;
}

/**
 * Regra RF06 / RF09 – Verificar conflito de horário
 */
export async function verificarConflitoHorario(funcionario_id, dataInicio) {
  const res = await query(
    `
    SELECT 1 
    FROM agendamento
    WHERE funcionario_id = $1
      AND data_hora_inicio = $2
    `,
    [funcionario_id, dataInicio]
  );

  return res.rowCount > 0;
}
