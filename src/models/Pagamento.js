import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Pagamento = sequelize.define(
  "Pagamento",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    agendamento_id: {
      type: DataTypes.INTEGER,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
    },
    metodo_pagamento: {
      type: DataTypes.STRING(50),
    },
    status: {
      type: DataTypes.STRING(30),
    },
  },
  {
    tableName: "pagamento",
    timestamps: true,
  }
);

export default Pagamento;
