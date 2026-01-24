import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ServicoFuncionario = sequelize.define(
  "ServicoFuncionario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    servico_id: {
      type: DataTypes.INTEGER,
    },
    funcionario_id: {
      type: DataTypes.INTEGER,
    },
    habilitado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "servico_funcionario",
    timestamps: false,
  }
);

export default ServicoFuncionario;
