import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PromocaoServico = sequelize.define(
  "PromocaoServico",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    promocao_id: {
      type: DataTypes.INTEGER,
    },
    servico_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "promocao_servico",
    timestamps: false,
  }
);

export default PromocaoServico;
