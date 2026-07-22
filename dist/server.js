"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST;
const server = http_1.default.createServer(app_1.default);
server.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});
server.keepAliveTimeout = 75_000; // align with proxies
server.headersTimeout = 76_000;
