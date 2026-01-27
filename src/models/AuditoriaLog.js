import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AuditoriaLog = sequelize.define(
  "AuditoriaLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    detalhes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "auditoria_logs",
    timestamps: true,
  }
);

export default AuditoriaLog;
