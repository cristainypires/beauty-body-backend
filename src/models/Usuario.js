import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apelido: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    numero_telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    data_nascimento: {
      type: DataTypes.DATE,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    palavra_passe: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    usuario_tipo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email_verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    telefone_verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  // Procure a definição do modelo Usuario
{
  sequelize,
  modelName: 'Usuario',
  tableName: 'usuario',
  timestamps: false, 
}
);

export default Usuario;
