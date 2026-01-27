import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Agendamento = sequelize.define(
  "Agendamento",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cliente_id: {
      type: DataTypes.INTEGER,
    },
    servico_id: {
      type: DataTypes.INTEGER,
    },
    funcionario_id: {
      type: DataTypes.INTEGER,
    },
    status_id: {
      type: DataTypes.INTEGER,
    },
    data_hora_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    data_hora_fim: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    feedback_nota: {
      type: DataTypes.INTEGER,
    },
    feedback_comentario: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "agendamento",
    timestamps: true,
createdAt: "criado_em",
updatedAt: "atualizado_em",

  }
);

export default Agendamento;
