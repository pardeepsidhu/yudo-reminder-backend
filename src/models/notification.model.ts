import { DataTypes, Model } from "sequelize";
import {sequelize} from "../config/db";
import {User } from "./user.model";

class Notification extends Model {}

Notification.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    type: {
      type: DataTypes.ENUM(
        "auth",
        "telegram",
        "yudo"
      ),
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    user: {
      type: DataTypes.INTEGER,
      allowNull: false,

      references: {
        model: User,
        key: "id",
      },
    },

    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    
  },
  {
    sequelize: sequelize,

    modelName: "Notification",

    tableName: "Notification",

    schema: "scheduler",

    timestamps: false,
  }
);

// Relations
User.hasMany(Notification, {
  foreignKey: "user",
});

Notification.belongsTo(User, {
  foreignKey: "user",
});

export default Notification;