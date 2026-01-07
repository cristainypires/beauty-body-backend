/**
 * Simula verificação de conflito de agendamento
 * usando dados em memória.
 */
const agendamentos = [
  { cliente_id: 1, inicio: new Date("2025-12-31T10:00:00"), fim: new Date("2025-12-31T11:30:00"), status: "ativo" },
  { cliente_id: 2, inicio: new Date("2025-12-31T12:00:00"), fim: new Date("2025-12-31T13:00:00"), status: "ativo" }
];

export default async function conflito_cliente(cliente_id, inicio, fim) {
  const inicioDate = new Date(inicio);
  const fimDate = new Date(fim);

  return agendamentos.find(a =>
    a.cliente_id === cliente_id &&
    a.status !== "cancelado" &&
    (
      (a.inicio >= inicioDate && a.inicio <= fimDate) ||
      (a.fim >= inicioDate && a.fim <= fimDate)
    )
  ) || null;
}
