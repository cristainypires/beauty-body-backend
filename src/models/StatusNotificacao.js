import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const StatusNotificacao = sequelize.define(
  "StatusNotificacao",
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
    tableName: "status_notificacao",
    timestamps: false,
  }
);

export default StatusNotificacao;
