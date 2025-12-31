/**
 * Calcula a data e hora de fim de um agendamento
 * com base na data de início e na duração do serviço.
 *
 * @param {string|Date} data_hora_inicio - Data/hora inicial do agendamento
 * @param {number} duracaoMinutos - Duração do serviço em minutos
 * @returns {Date} - Data/hora de fim do agendamento
 */
export default function calcular_fim_servico(data_hora_inicio, duracaoMinutos) {
  // Converte a data de início para objeto Date
  const inicio = new Date(data_hora_inicio);

  // Validação básica
  if (isNaN(inicio.getTime())) {
    throw new Error("Data de início inválida");
  }

  if (duracaoMinutos <= 0) {
    throw new Error("Duração do serviço inválida");
  }

  // Converte minutos para milissegundos
  const duracaoEmMs = duracaoMinutos * 60 * 1000;

  // Calcula data/hora final
  const fim = new Date(inicio.getTime() + duracaoEmMs);

  return fim;
}
