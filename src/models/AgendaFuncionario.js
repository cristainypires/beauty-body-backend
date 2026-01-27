import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AgendaFuncionario = sequelize.define(
  "AgendaFuncionario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    funcionario_id: {
      type: DataTypes.INTEGER,
    },
    dia_semana: {
      type: DataTypes.INTEGER,
    },
    hora_inicio: {
      type: DataTypes.TIME,
    },
    hora_fim: {
      type: DataTypes.TIME,
    },
    disponivel: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "agenda_funcionario",
    timestamps: true,
  }
);

export default AgendaFuncionario;
