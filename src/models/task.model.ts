import { DataTypes, Model } from "sequelize";
import {sequelize }from "../config/db";
import {User} from "./user.model";

class Task extends Model {}

Task.init(
  {
    user: {
      type: DataTypes.INTEGER,
      allowNull: false,

      references: {
        model: User,
        key: "id",
      },
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "to do",
        "in progress",
        "done"
      ),
      allowNull: false,
      defaultValue: "pending",
    },

    estimatedTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    time: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    priority: {
      type: DataTypes.ENUM(
        "high",
        "normal",
        "low"
      ),
      allowNull: false,
      defaultValue: "normal",
    },
    isPartOfRoutine: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  },
  {
    sequelize: sequelize,

    modelName: "Task",

    tableName: "Task",

    schema: "scheduler",

    timestamps: true,
  }
);

// Relations
User.hasMany(Task, {
  foreignKey: "user",
});

Task.belongsTo(User, {
  foreignKey: "user",
});

export default Task;