"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const routes_1 = __importDefault(require("./routes"));
const error_handler_1 = require("./middlewares/error_handler");
const app_1 = require("./app");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes_1.default);
app.use(error_handler_1.notFound);
app.use(error_handler_1.errorHandler);
app.use(async (req, res, next) => {
    await (0, app_1.connectDB)();
    next();
});
exports.handler = (0, serverless_http_1.default)(app);
