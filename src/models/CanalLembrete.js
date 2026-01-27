import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CanalLembrete = sequelize.define(
  "CanalLembrete",
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
    tableName: "canal_lembrete",
    timestamps: false,
  }
);

export default CanalLembrete;
