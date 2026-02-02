import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Admin = sequelize.define(
  "Admin",
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
  },
  {
    tableName: "admin",
    timestamps: false,
  }
);

export default Admin;
