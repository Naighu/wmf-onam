"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const rabbitmq_1 = require("./services/rabbitmq");
const participant_1 = __importDefault(require("./model/participant"));
const mongodb_1 = require("./services/mongodb");
const app = (0, express_1.default)();
const PORT = Number(process.env.SOCKET_PORT) || 3000;
const httpServer = (0, http_1.createServer)(app);
const COMPETITION_LIVE_QUEUE = "competition-live";
const PREVIEW_SCREEN_QUEUE = "preview-screen";
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.get("/", (_, res) => {
    res.send("Socket server is running");
});
io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    console.log(`Connected clients: ${io.engine.clientsCount}`);
    const token = socket.client.request.headers.token;
    if (token && socket.client.request.headers.connection_type === "user") {
        participant_1.default.find({ is_live: true }).then((participants) => {
            const p = participants.filter((e) => !e.marked_by.includes(token));
            socket.emit(COMPETITION_LIVE_QUEUE, JSON.stringify(p));
        });
    }
    else if (socket.client.request.headers.connection_type != "preview-screen") {
        socket.disconnect(true);
    }
    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
        console.log(`Connected clients: ${io.engine.clientsCount}`);
    });
});
async function connect() {
    const { channel } = await (0, rabbitmq_1.connectRabbitMQ)();
    return channel;
}
async function consumeLiveQueue(channel) {
    await channel.assertQueue(COMPETITION_LIVE_QUEUE, {
        durable: true,
    });
    console.log(`Waiting for messages in ${COMPETITION_LIVE_QUEUE}...`);
    channel.consume(COMPETITION_LIVE_QUEUE, (msg) => {
        if (!msg)
            return;
        const data = msg.content.toString();
        console.log("Received:", data);
        io.emit(COMPETITION_LIVE_QUEUE, data);
        channel.ack(msg);
    });
}
async function consumePreviewScreenQueue(channel) {
    await channel.assertQueue(PREVIEW_SCREEN_QUEUE, {
        durable: true,
    });
    console.log(`Waiting for messages in ${PREVIEW_SCREEN_QUEUE}...`);
    channel.consume(PREVIEW_SCREEN_QUEUE, (msg) => {
        if (!msg)
            return;
        const data = msg.content.toString();
        console.log("Received:", data);
        io.emit(PREVIEW_SCREEN_QUEUE, data);
        channel.ack(msg);
    });
}
async function start() {
    try {
        const channel = await connect();
        await (0, mongodb_1.connectDB)();
        await consumeLiveQueue(channel);
        await consumePreviewScreenQueue(channel);
        httpServer.listen(PORT, () => {
            console.log(`🚀 Socket.IO server running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("Startup failed:", err);
        process.exit(1);
    }
}
start();
