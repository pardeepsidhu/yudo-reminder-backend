"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
var db_1 = require("../config/db");
var user_model_1 = require("./user.model");
var Task = /** @class */ (function (_super) {
    __extends(Task, _super);
    function Task() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Task;
}(sequelize_1.Model));
Task.init({
    user: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: user_model_1.User,
            key: "id",
        },
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("pending", "to do", "in progress", "done"),
        allowNull: false,
        defaultValue: "pending",
    },
    estimatedTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    time: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    priority: {
        type: sequelize_1.DataTypes.ENUM("high", "normal", "low"),
        allowNull: false,
        defaultValue: "normal",
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "Task",
    tableName: "Task",
    schema: "scheduler",
    timestamps: true,
});
// Relations
user_model_1.User.hasMany(Task, {
    foreignKey: "user",
});
Task.belongsTo(user_model_1.User, {
    foreignKey: "user",
});
exports.default = Task;
