import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";
import { User } from "./user.model";
import Task from "./task.model";
import { Email } from "./email.model";

/**
 * ─────────────────────────────────────────────────────────
 * Routine
 * ─────────────────────────────────────────────────────────
 * Notes on cleanup vs the original model:
 * - `weeklyDays`, `monthDay`, `customInterval`, `customUnit` were four
 *   columns that are only ever used one-at-a-time depending on
 *   `repeatType`. They're merged into a single `repeatConfig` JSON
 *   column to avoid a row full of mutually-exclusive nulls.
 * - `endDate` and `repeatUntil` represented the same concept (the date
 *   a routine's occurrences stop) depending on `dateMode`. Merged into
 *   a single `endDate`.
 * - Foreign key renamed `user` -> `userId` (clearer, avoids shadowing
 *   the `User` model name / the eventual `belongsTo` alias).
 */
class Routine extends Model {}

Routine.init(
  {
    userId: {
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
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    priority: {
      type: DataTypes.ENUM("critical", "high", "medium", "low", "optional"),
      allowNull: false,
      defaultValue: "medium",
    },

    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // --- Repeat config ---
    repeatType: {
      type: DataTypes.ENUM("once", "daily", "weekly", "monthly", "yearly", "custom"),
      allowNull: false,
      defaultValue: "once",
    },

    // Shape depends on repeatType:
    //  weekly  -> { days: number[] }        // 0-6, Sun-Sat
    //  monthly -> { day: number }            // day of month
    //  custom  -> { interval: number, unit: "days" | "weeks" | "months" }
    repeatConfig: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },

    // --- Date range config ---
    dateMode: {
      type: DataTypes.ENUM("single", "range", "until", "forever"),
      allowNull: false,
      defaultValue: "single",
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Used as the range end date (dateMode = "range") or the
    // repeat-until date (dateMode = "until"). Ignored otherwise.
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    skipDates: {
      // array of "YYYY-MM-DD" strings excluded from generated occurrences
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    // --- Time config ---
    allDay: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    startTime: {
      // "HH:mm", null when allDay = true
      type: DataTypes.STRING,
      allowNull: true,
    },

    endTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    estimatedMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // --- Misc ---
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    status: {
      type: DataTypes.ENUM("active", "paused", "archived"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    sequelize,
    modelName: "Routine",
    tableName: "Routine",
    schema: "scheduler",
    timestamps: true,
  }
);

/**
 * ─────────────────────────────────────────────────────────
 * RoutineTask (junction table: Routine <-> Task)
 * ─────────────────────────────────────────────────────────
 * Links a Routine to the Task(s) it generates/is associated with.
 */
class RoutineTask extends Model {}

RoutineTask.init(
  {
    routineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Routine,
        key: "id",
      },
    },

    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "RoutineTask",
    tableName: "RoutineTask",
    schema: "scheduler",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["routineId", "taskId"],
      },
    ],
  }
);

/**
 * ─────────────────────────────────────────────────────────
 * RoutineReminder (junction table: Routine <-> Email)
 * ─────────────────────────────────────────────────────────
 * Links a Routine to the scheduled Email that acts as its reminder.
 */
class RoutineReminder extends Model {}

RoutineReminder.init(
  {
    routineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Routine,
        key: "id",
      },
    },

    emailId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Email,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "RoutineReminder",
    tableName: "RoutineReminder",
    schema: "scheduler",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["routineId", "emailId"],
      },
    ],
  }
);

// ───────────── Relations ─────────────

// User <-> Routine
User.hasMany(Routine, { foreignKey: "userId" });
Routine.belongsTo(User, { foreignKey: "userId" });

// Routine <-> Task (through RoutineTask)
Routine.belongsToMany(Task, { through: RoutineTask, foreignKey: "routineId", otherKey: "taskId" });
Task.belongsToMany(Routine, { through: RoutineTask, foreignKey: "taskId", otherKey: "routineId" });
Routine.hasMany(RoutineTask, { foreignKey: "routineId" });
Task.hasMany(RoutineTask, { foreignKey: "taskId" });
RoutineTask.belongsTo(Routine, { foreignKey: "routineId" });
RoutineTask.belongsTo(Task, { foreignKey: "taskId" });

// Routine <-> Email (through RoutineReminder)
Routine.belongsToMany(Email, { through: RoutineReminder, foreignKey: "routineId", otherKey: "emailId" });
Email.belongsToMany(Routine, { through: RoutineReminder, foreignKey: "emailId", otherKey: "routineId" });
Routine.hasMany(RoutineReminder, { foreignKey: "routineId" });
Email.hasMany(RoutineReminder, { foreignKey: "emailId" });
RoutineReminder.belongsTo(Routine, { foreignKey: "routineId" });
RoutineReminder.belongsTo(Email, { foreignKey: "emailId" });

export { Routine, RoutineTask, RoutineReminder };
export default Routine;