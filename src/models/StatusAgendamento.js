import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const StatusAgendamento = sequelize.define(
  "StatusAgendamento",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(30),
      unique: true,
    },
  },
  {
    tableName: "status_agendamento",
    timestamps: false,
  }
);

export default StatusAgendamento;
