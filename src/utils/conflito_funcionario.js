/**
 * Simula verificação de conflito de agendamento para funcionário
 * usando dados em memória.
 */

const agendamentos = [
  { id: 1, funcionario_id: 1, inicio: new Date("2025-12-31T10:00:00"), fim: new Date("2025-12-31T11:00:00"), status: "ativo" },
  { id: 2, funcionario_id: 2, inicio: new Date("2025-12-31T12:00:00"), fim: new Date("2025-12-31T13:00:00"), status: "ativo" },
];

export async function conflito_funcionario(funcionario_id, inicio, fim, agendamento_id = null) {
  const inicioDate = new Date(inicio);
  const fimDate = new Date(fim);

  const conflito = agendamentos.find(a =>
    a.funcionario_id === funcionario_id &&
    !["cancelado", "expirado"].includes(a.status) &&
    a.inicio < fimDate &&
    a.fim > inicioDate &&
    (!agendamento_id || a.id !== agendamento_id)
  );

  return !!conflito;
}
