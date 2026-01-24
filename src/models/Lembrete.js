import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Lembrete = sequelize.define(
  "Lembrete",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    agendamento_id: {
      type: DataTypes.INTEGER,
    },
    status_id: {
      type: DataTypes.INTEGER,
    },
    enviar_em: {
      type: DataTypes.DATE,
    },
    canal_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "lembrete",
    timestamps: true,
  }
);

export default Lembrete;
