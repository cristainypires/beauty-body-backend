import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CanalNotificacao = sequelize.define(
  "CanalNotificacao",
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
    tableName: "canal_notificacao",
    timestamps: false,
  }
);

export default CanalNotificacao;
