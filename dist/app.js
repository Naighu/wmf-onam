"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_handler_1 = require("./middlewares/error_handler");
const routes_1 = __importDefault(require("./routes"));
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false;
async function connectDB() {
    if (isConnected)
        return;
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected");
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes_1.default);
app.use(error_handler_1.notFound);
app.use(error_handler_1.errorHandler);
exports.default = app;
