"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const rabbitmq_1 = require("./services/rabbitmq");
const app = (0, express_1.default)();
const PORT = Number(process.env.SOCKET_PORT) || 3000;
// Create HTTP server
const httpServer = (0, http_1.createServer)(app);
// Create Socket.IO server
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // Change this to your frontend URL in production
        methods: ["GET", "POST"],
    },
});
// Health check
app.get("/", (_, res) => {
    res.send("Socket server is running");
});
// Socket.IO connection
io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    console.log(`Connected clients: ${io.engine.clientsCount}`);
    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
        console.log(`Connected clients: ${io.engine.clientsCount}`);
    });
});
// Connect RabbitMQ
async function connect() {
    const { channel } = await (0, rabbitmq_1.connectRabbitMQ)();
    return channel;
}
// Consume RabbitMQ messages
async function consumeLiveQueue(channel) {
    const queue = "competition-live";
    await channel.assertQueue(queue, {
        durable: true,
    });
    console.log(`Waiting for messages in ${queue}...`);
    channel.consume(queue, (msg) => {
        if (!msg)
            return;
        const data = msg.content.toString();
        console.log("Received:", data);
        // Broadcast to every connected client
        io.emit(queue, data);
        // Acknowledge message
        channel.ack(msg);
    });
}
// Start everything
async function start() {
    try {
        const channel = await connect();
        await consumeLiveQueue(channel);
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
