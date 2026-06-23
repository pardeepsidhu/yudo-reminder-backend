"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocument = exports.swaggerUi = void 0;
var swagger_ui_express_1 = require("swagger-ui-express");
exports.swaggerUi = swagger_ui_express_1.default;
var yamljs_1 = require("yamljs");
var path_1 = require("path");
var swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, "../docs/swagger.yaml"));
exports.swaggerDocument = swaggerDocument;
