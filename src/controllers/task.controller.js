"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksByTimeframe = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
var task_model_1 = require("../models/task.model");
var sequelize_1 = require("sequelize");
var createTask = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, status_1, estimatedTime, time, priority, user, task, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, title = _a.title, description = _a.description, status_1 = _a.status, estimatedTime = _a.estimatedTime, time = _a.time, priority = _a.priority;
                console.log("reqee", req.user);
                user = req.user.id;
                if (!title || !description) {
                    return [2 /*return*/, res.status(400).send({ error: "Please provide all required fields!" })];
                }
                return [4 /*yield*/, task_model_1.default.create({
                        user: user,
                        title: title,
                        description: description,
                        status: status_1 || "pending",
                        estimatedTime: estimatedTime,
                        time: time,
                        priority: priority || "normal",
                    })];
            case 1:
                task = _b.sent();
                res.status(201).send({ message: "Task created successfully", task: task });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error("Error creating task:", error_1);
                res.status(500).send({ error: "Failed to create task" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createTask = createTask;
var getTasks = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, limit, skip, priority, startDate, endDate, query, endOfDay, tasks, total, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                user = req.user.id;
                limit = parseInt(req.query.limit);
                skip = parseInt(req.query.skip) || 0;
                priority = req.query.priority;
                startDate = req.query.startDate;
                endDate = req.query.endDate;
                query = { user: user };
                if (priority && ["high", "normal", "low"].includes(priority)) {
                    query.priority = priority;
                }
                if (startDate || endDate) {
                    query.createdAt = {};
                    if (startDate) {
                        query.createdAt[sequelize_1.Op.gte] = new Date(startDate);
                    }
                    if (endDate) {
                        endOfDay = new Date(endDate);
                        endOfDay.setHours(23, 59, 59, 999);
                        query.createdAt[sequelize_1.Op.lte] = endOfDay;
                    }
                }
                tasks = void 0;
                if (!limit) return [3 /*break*/, 2];
                return [4 /*yield*/, task_model_1.default.findAll({
                        where: query,
                        order: [["createdAt", "DESC"]],
                        offset: skip,
                        limit: limit,
                    })];
            case 1:
                tasks = _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, task_model_1.default.findAll({
                    where: query,
                    order: [["createdAt", "DESC"]],
                    offset: skip,
                })];
            case 3:
                tasks = _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, task_model_1.default.count({ where: query })];
            case 5:
                total = _a.sent();
                res.json({
                    tasks: tasks,
                    total: total,
                    hasMore: total > (skip + tasks.length),
                });
                return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                console.error("Error fetching tasks:", error_2);
                res.status(500).json({
                    error: "Failed to fetch tasks",
                    message: error_2.message,
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.getTasks = getTasks;
var getTaskById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var task, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, task_model_1.default.findOne({
                        where: {
                            id: req.params.id,
                            user: req.user.id,
                        },
                    })];
            case 1:
                task = _a.sent();
                if (!task) {
                    return [2 /*return*/, res.status(404).send({ error: "Task not found!" })];
                }
                res.send(task);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error("Error fetching task:", error_3);
                res.status(500).send({ error: "Failed to fetch task" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getTaskById = getTaskById;
var updateTask = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, updates, task, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                updates = req.body;
                return [4 /*yield*/, task_model_1.default.findOne({
                        where: {
                            id: id,
                            user: req.user.id,
                        },
                    })];
            case 1:
                task = _a.sent();
                if (!task) {
                    return [2 /*return*/, res.status(404).send({ error: "Task not found or not authorized" })];
                }
                return [4 /*yield*/, task.update(updates)];
            case 2:
                _a.sent();
                res.send({ message: "Task updated", task: task });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error("Error updating task:", error_4);
                res.status(500).send({ error: "Failed to update task" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateTask = updateTask;
var deleteTask = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, task, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, task_model_1.default.findOne({
                        where: {
                            id: id,
                            user: req.user.id,
                        },
                    })];
            case 1:
                task = _a.sent();
                if (!task) {
                    return [2 /*return*/, res.status(404).send({ error: "Task not found or not authorized" })];
                }
                return [4 /*yield*/, task.destroy()];
            case 2:
                _a.sent();
                res.send({ message: "Task deleted successfully" });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                console.error("Error deleting task:", error_5);
                res.status(500).send({ error: "Failed to delete task" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteTask = deleteTask;
var getTasksByTimeframe = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, timeframe, limit, page, skip, startDate, endDate, query, today, day, diff, total, tasks, allFilteredTasks, taskStats, totalPages, hasMore, error_6;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 4, , 5]);
                user = req.user.id;
                timeframe = req.params.timeframe;
                limit = parseInt(req.query.limit) || 10;
                page = parseInt(req.query.page) || 1;
                skip = (page - 1) * limit;
                startDate = void 0, endDate = void 0;
                query = { user: user };
                if (req.query.startDate && req.query.endDate) {
                    startDate = new Date(req.query.startDate);
                    endDate = new Date(req.query.endDate);
                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        return [2 /*return*/, res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" })];
                    }
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);
                    if (endDate < startDate) {
                        return [2 /*return*/, res.status(400).json({ error: "End date cannot be before start date" })];
                    }
                    query[sequelize_1.Op.or] = [
                        {
                            createdAt: (_a = {},
                                _a[sequelize_1.Op.gte] = startDate,
                                _a[sequelize_1.Op.lte] = endDate,
                                _a),
                        },
                        {
                            "time.stated": (_b = {},
                                _b[sequelize_1.Op.lte] = endDate,
                                _b),
                            "time.ended": (_c = {},
                                _c[sequelize_1.Op.gte] = startDate,
                                _c),
                        },
                    ];
                }
                else if (timeframe === "week" || timeframe === "month") {
                    today = new Date();
                    if (timeframe === "week") {
                        day = today.getDay();
                        startDate = new Date(today);
                        diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
                        startDate.setDate(diff);
                        startDate.setHours(0, 0, 0, 0);
                        endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + 6);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    else {
                        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                        startDate.setHours(0, 0, 0, 0);
                        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    query[sequelize_1.Op.or] = [
                        {
                            createdAt: (_d = {},
                                _d[sequelize_1.Op.gte] = startDate,
                                _d[sequelize_1.Op.lte] = endDate,
                                _d),
                        },
                        {
                            "time.stated": (_e = {},
                                _e[sequelize_1.Op.lte] = endDate,
                                _e),
                            "time.ended": (_f = {},
                                _f[sequelize_1.Op.gte] = startDate,
                                _f),
                        },
                    ];
                }
                else if (timeframe === "all" || !timeframe) {
                    startDate = null;
                    endDate = null;
                }
                else {
                    return [2 /*return*/, res.status(400).json({
                            error: "Invalid timeframe. Use 'week', 'month', or 'all'",
                        })];
                }
                return [4 /*yield*/, task_model_1.default.count({ where: query })];
            case 1:
                total = _g.sent();
                return [4 /*yield*/, task_model_1.default.findAll({
                        where: query,
                        order: [["createdAt", "DESC"]],
                        offset: skip,
                        limit: limit,
                    })];
            case 2:
                tasks = _g.sent();
                return [4 /*yield*/, task_model_1.default.findAll({
                        where: query,
                        attributes: ["status", "priority"],
                    })];
            case 3:
                allFilteredTasks = _g.sent();
                taskStats = {
                    total: total,
                    pending: allFilteredTasks.filter(function (task) { return task.status === "pending"; }).length,
                    todo: allFilteredTasks.filter(function (task) { return task.status === "to do"; }).length,
                    inProgress: allFilteredTasks.filter(function (task) { return task.status === "in progress"; }).length,
                    done: allFilteredTasks.filter(function (task) { return task.status === "done"; }).length,
                    byPriority: {
                        high: allFilteredTasks.filter(function (task) { return task.priority === "high"; }).length,
                        normal: allFilteredTasks.filter(function (task) { return task.priority === "normal"; }).length,
                        low: allFilteredTasks.filter(function (task) { return task.priority === "low"; }).length,
                    },
                };
                totalPages = Math.ceil(total / limit);
                hasMore = page < totalPages;
                res.json({
                    timeframe: timeframe || "all",
                    startDate: startDate,
                    endDate: endDate,
                    tasks: tasks,
                    stats: taskStats,
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        limit: limit,
                        total: total,
                        hasMore: hasMore,
                        count: tasks.length,
                    },
                });
                return [3 /*break*/, 5];
            case 4:
                error_6 = _g.sent();
                console.error("Error fetching tasks for time period:", error_6);
                res.status(500).json({
                    error: "Failed to fetch tasks for the specified time period",
                    message: error_6.message,
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getTasksByTimeframe = getTasksByTimeframe;
