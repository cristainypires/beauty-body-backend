import { query } from "../database/index.js";

/**
 * Calcula a data e hora de fim de um agendamento
 */
export function calcular_fim_servico(data_hora_inicio, duracaoMinutos) {
  const inicio = new Date(data_hora_inicio);
  if (isNaN(inicio.getTime())) throw new Error("Data de início inválida");
  return new Date(inicio.getTime() + duracaoMinutos * 60 * 1000);
}

/**
 * Verifica se o funcionário já tem um compromisso que se sobrepõe ao horário desejado
 */
export async function tem_conflito_funcionario(
  funcionario_id,
  inicio,
  fim,
  agendamento_id_ignorar = null,
) {
  // SQL que verifica sobreposição (Overlap): (InicioA < FimB) AND (FimA > InicioB)
  const sql = `
    SELECT 1 FROM agendamento 
    WHERE funcionario_id = $1 
    AND status_id NOT IN (SELECT id FROM status_agendamento WHERE nome IN ('cancelado', 'expirado'))
    AND data_hora_inicio < $3 
    AND data_hora_fim > $2
    ${agendamento_id_ignorar ? `AND id != ${agendamento_id_ignorar}` : ""}
    LIMIT 1
  `;
  const res = await query(sql, [funcionario_id, inicio, fim]);
  return res.rowCount > 0;
}

/**
 * Verifica se o cliente já tem outro agendamento no mesmo horário
 */
export async function tem_conflito_cliente(cliente_id, inicio, fim) {
  const sql = `
    SELECT 1 FROM agendamento 
    WHERE cliente_id = $1 
    AND status_id NOT IN (SELECT id FROM status_agendamento WHERE nome IN ('cancelado', 'expirado'))
    AND data_hora_inicio < $3 
    AND data_hora_fim > $2
    LIMIT 1
  `;
  const res = await query(sql, [cliente_id, inicio, fim]);
  return res.rowCount > 0;
}

/**
 * Normaliza o array de agendamentos, removendo nulos/undefined e garantindo campos obrigatórios
 */
export function normalizarAgenda(agenda) {
  if (!Array.isArray(agenda)) return [];
  return agenda
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      // Extrai dados do cliente (compatível com Sequelize)
      const cliente = item.cliente || item.Cliente || {};
      const usuario = cliente.usuario || cliente.Usuario || {};
      // Extrai dados do serviço
      const servico = item.servico || item.Servico || {};
      // Extrai status
      const status = item.status_agendamento || item.StatusAgendamento || {};

      return {
        id: item.id ?? null,
        data_hora_inicio: item.data_hora_inicio ?? null,
        data_hora_fim: item.data_hora_fim ?? null,
        nome_cliente: usuario.nome ?? null,
        telefone_cliente: usuario.numero_telefone ?? null,
        nome_servico: servico.nome_servico ?? null,
        duracao_servico: servico.duracao_minutos ?? null,
        preco_servico: servico.preco ?? null,
        status: status.nome ?? null,
        // Mantém os objetos originais caso precise
        cliente,
        servico,
        status_agendamento: status,
      };
    });
}

/**
 * Regra das 72h para cancelamento/reagendamento
 */
export function validar_regra_72h(data_agendamento) {
  const agora = new Date();
  const inicio = new Date(data_agendamento);
  const diffHoras = (inicio - agora) / (1000 * 60 * 60);
  return diffHoras >= 72;
}
