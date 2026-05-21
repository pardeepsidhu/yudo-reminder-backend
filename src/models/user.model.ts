import { DataTypes, Model } from "sequelize";
import {sequelize }from "../config/db";

class User extends Model {}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    profile: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    telegram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: sequelize,

    modelName: "User",

    tableName: "User", // same collection name style

    schema: "scheduler",

    timestamps: true, // createdAt & updatedAt same as mongoose
  }
);

export  {User};