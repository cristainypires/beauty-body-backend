import Usuario from "./Usuario.js";
import Cliente from "./Cliente.js";
import Funcionario from "./Funcionario.js";
import Admin from "./Admin.js";
import Servico from "./Servico.js";
import ServicoFuncionario from "./ServicoFuncionario.js";
import Agendamento from "./Agendamento.js";
import StatusAgendamento from "./StatusAgendamento.js";
import AgendaFuncionario from "./AgendaFuncionario.js";
import AuditoriaLog from "./AuditoriaLog.js";
import Pagamento from "./Pagamento.js";
import Promocao from "./Promocao.js";
import PromocaoServico from "./PromocaoServico.js";
import Notificacao from "./Notificacao.js";
import StatusNotificacao from "./StatusNotificacao.js";
import CanalNotificacao from "./CanalNotificacao.js";
import Lembrete from "./Lembrete.js";
import StatusLembrete from "./StatusLembrete.js";
import CanalLembrete from "./CanalLembrete.js";
import sequelize from "../config/database.js";

// Definir relacionamentos
Usuario.hasOne(Cliente, { foreignKey: "usuario_id" });
Cliente.belongsTo(Usuario, { foreignKey: "usuario_id" });

Usuario.hasOne(Funcionario, { foreignKey: "usuario_id" });
Funcionario.belongsTo(Usuario, { foreignKey: "usuario_id" });

Usuario.hasOne(Admin, { foreignKey: "usuario_id" });
Admin.belongsTo(Usuario, { foreignKey: "usuario_id" });

Funcionario.hasMany(AgendaFuncionario, { foreignKey: "funcionario_id" });
AgendaFuncionario.belongsTo(Funcionario, { foreignKey: "funcionario_id" });

Funcionario.hasMany(ServicoFuncionario, { foreignKey: "funcionario_id" });
ServicoFuncionario.belongsTo(Funcionario, { foreignKey: "funcionario_id" });

Servico.hasMany(ServicoFuncionario, { foreignKey: "servico_id" });
ServicoFuncionario.belongsTo(Servico, { foreignKey: "servico_id" });

Agendamento.belongsTo(Cliente, { foreignKey: "cliente_id" });
Cliente.hasMany(Agendamento, { foreignKey: "cliente_id" });

Agendamento.belongsTo(Servico, { foreignKey: "servico_id" });
Servico.hasMany(Agendamento, { foreignKey: "servico_id" });

Agendamento.belongsTo(Funcionario, { foreignKey: "funcionario_id" });
Funcionario.hasMany(Agendamento, { foreignKey: "funcionario_id" });

Agendamento.belongsTo(StatusAgendamento, { foreignKey: "status_id" });
StatusAgendamento.hasMany(Agendamento, { foreignKey: "status_id" });

Pagamento.belongsTo(Agendamento, { foreignKey: "agendamento_id" });
Agendamento.hasOne(Pagamento, { foreignKey: "agendamento_id" });

Promocao.hasMany(PromocaoServico, { foreignKey: "promocao_id" });
PromocaoServico.belongsTo(Promocao, { foreignKey: "promocao_id" });

Servico.hasMany(PromocaoServico, { foreignKey: "servico_id" });
PromocaoServico.belongsTo(Servico, { foreignKey: "servico_id" });

Notificacao.belongsTo(Agendamento, { foreignKey: "agendamento_id" });
Agendamento.hasMany(Notificacao, { foreignKey: "agendamento_id" });

Notificacao.belongsTo(Usuario, { foreignKey: "usuario_id" });
Usuario.hasMany(Notificacao, { foreignKey: "usuario_id" });

Notificacao.belongsTo(CanalNotificacao, { foreignKey: "canal_id" });
CanalNotificacao.hasMany(Notificacao, { foreignKey: "canal_id" });

Notificacao.belongsTo(StatusNotificacao, { foreignKey: "status_id" });
StatusNotificacao.hasMany(Notificacao, { foreignKey: "status_id" });

Lembrete.belongsTo(Agendamento, { foreignKey: "agendamento_id" });
Agendamento.hasMany(Lembrete, { foreignKey: "agendamento_id" });

Lembrete.belongsTo(StatusLembrete, { foreignKey: "status_id" });
StatusLembrete.hasMany(Lembrete, { foreignKey: "status_id" });

Lembrete.belongsTo(CanalLembrete, { foreignKey: "canal_id" });
CanalLembrete.hasMany(Lembrete, { foreignKey: "canal_id" });

export {
  Usuario,
  Cliente,
  Funcionario,
  Admin,
  Servico,
  ServicoFuncionario,
  Agendamento,
  StatusAgendamento,
  AgendaFuncionario,
  AuditoriaLog,
  Pagamento,
  Promocao,
  PromocaoServico,
  Notificacao,
  StatusNotificacao,
  CanalNotificacao,
  Lembrete,
  StatusLembrete,
  CanalLembrete,
  sequelize,
};
