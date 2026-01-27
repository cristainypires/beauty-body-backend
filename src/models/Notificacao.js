import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Notificacao = sequelize.define(
  "Notificacao",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: DataTypes.STRING(50),
    },
    data_hora: {
      type: DataTypes.DATE,
    },
    agendamento_id: {
      type: DataTypes.INTEGER,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
    },
    canal_id: {
      type: DataTypes.INTEGER,
    },
    status_id: {
      type: DataTypes.INTEGER,
    },
    conteudo: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "notificacao",
    timestamps: true,
  }
);

export default Notificacao;
