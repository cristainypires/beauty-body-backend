import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const StatusLembrete = sequelize.define(
  "StatusLembrete",
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
    tableName: "status_lembrete",
    timestamps: false,
  }
);

export default StatusLembrete;
