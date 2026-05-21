import { DataTypes, Model } from "sequelize";
import {sequelize }from "../config/db";

class Email extends Model {}

Email.init(
  {
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    scheduleTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    jobId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "sent",
        "failed"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize: sequelize,

    modelName: "Email",

    tableName: "Email",

    schema: "scheduler",

    timestamps: true,
  }
);

export {Email};