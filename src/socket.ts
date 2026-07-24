import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Channel } from "amqplib";
import { connectRabbitMQ } from "./services/rabbitmq";

const app = express();
const PORT = Number(process.env.SOCKET_PORT) || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
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

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    console.log(`Connected clients: ${io.engine.clientsCount}`);
  });
});

async function connect() {
  const { channel } = await connectRabbitMQ();
  return channel;
}

async function consumeLiveQueue(channel: Channel) {
  const queue = "competition-live";

  await channel.assertQueue(queue, {
    durable: true,
  });

  console.log(`Waiting for messages in ${queue}...`);

  channel.consume(queue, (msg) => {
    if (!msg) return;

    const data = msg.content.toString();

    console.log("Received:", data);

    io.emit(queue, data);

    channel.ack(msg);
  });
}

async function start() {
  try {
    const channel = await connect();

    await consumeLiveQueue(channel);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Socket.IO server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();