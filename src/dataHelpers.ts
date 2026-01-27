export function ensureAgendaItem(item: any) {
  return {
    id: item.id,
    cliente:
      item.cliente ??
      item.cliente_nome ??
      item.Cliente?.Usuario?.nome ??
      "—",

    telefone:
      item.telefone ??
      item.cliente_telefone ??
      item.Cliente?.Usuario?.numero_telefone ??
      "",

    servico:
      item.servico ??
      item.nome_servico ??
      item.Servico?.nome_servico ??
      "—",

    status:
      item.status ??
      item.StatusAgendamento?.nome ??
      "pendente",

    data:
      item.data ??
      item.data_hora_inicio?.split("T")[0] ??
      "",

    hora:
      item.hora ??
      item.data_hora_inicio?.split("T")[1]?.slice(0, 5) ??
      "",

    obs: item.obs ?? "",
  };
}

export const safeArray = <T>(v: any): T[] =>
  Array.isArray(v) ? v : [];

export const parseDateSafe = (value: string) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};
