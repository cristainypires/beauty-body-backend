import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Funcionario = sequelize.define(
  "Funcionario",
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
    
    tipo: {
      type: DataTypes.STRING(20),
      defaultValue: "funcionario",
    },
    funcao_especialidade: {
      type: DataTypes.STRING(100),
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  
    {
    tableName: "funcionario",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: false,   // corresponde à coluna no banco
   }
);

export default Funcionario;
