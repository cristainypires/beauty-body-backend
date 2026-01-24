import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Cliente = sequelize.define(
  "Cliente",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    criado_em: {
      type: DataTypes.DATE,
      field: "criado_em",
    },
  },
  {
    tableName: "cliente",
    timestamps: false,
    createdAt: "criado_em",
    updatedAt: false,
  }
);

export default Cliente;
