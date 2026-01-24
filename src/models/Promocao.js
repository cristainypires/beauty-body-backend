import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Promocao = sequelize.define(
  "Promocao",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
    },
    descricao: {
      type: DataTypes.TEXT,
    },
    tipo: {
      type: DataTypes.STRING(20),
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
    },
    data_inicio: {
      type: DataTypes.DATE,
    },
    data_fim: {
      type: DataTypes.DATE,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "promocao",
    timestamps: false, 
    underscored: true 
  }
);

export default Promocao;
