import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Servico = sequelize.define(
  "Servico",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_servico: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    duracao_minutos: {
      type: DataTypes.INTEGER,
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "servico",
    timestamps: true,
  }
);

export default Servico;
