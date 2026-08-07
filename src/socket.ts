import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Channel } from "amqplib";
import { connectRabbitMQ } from "./services/rabbitmq";
import Participant from "./model/participant";
import { connectDB } from "./services/mongodb";
const app = express();
const PORT = Number(process.env.SOCKET_PORT) || 3000;

const httpServer = createServer(app);
const COMPETITION_LIVE_QUEUE = "competition-live";
 const PREVIEW_SCREEN_QUEUE = "preview-screen";
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (_, res) => {
  res.send("Socket server is running");
});

io.engine.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  console.log(`Connected clients: ${io.engine.clientsCount}`);
  const token = socket.request.headers.token

  if (token && socket.request.headers["connection-type"] === "user") {

  } else if (socket.request.headers["connection-type"] != "preview-screen") {
    socket.disconnect(true)
  }

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

  await channel.assertQueue(COMPETITION_LIVE_QUEUE, {
    durable: true,
  });

  console.log(`Waiting for messages in ${COMPETITION_LIVE_QUEUE}...`);

  channel.consume(COMPETITION_LIVE_QUEUE, (msg) => {
    if (!msg) return;

    const data = msg.content.toString();

    console.log("Received:", data);

    io.emit(COMPETITION_LIVE_QUEUE, data);

    channel.ack(msg);
  });
}

async function consumePreviewScreenQueue(channel: Channel) {
 

  await channel.assertQueue(PREVIEW_SCREEN_QUEUE, {
    durable: true,
  });

  console.log(`Waiting for messages in ${PREVIEW_SCREEN_QUEUE}...`);

  channel.consume(PREVIEW_SCREEN_QUEUE, (msg) => {
    if (!msg) return;

    const data = msg.content.toString();

    console.log("Received:", data);

    io.emit(PREVIEW_SCREEN_QUEUE, data);

    channel.ack(msg);
  });
}

async function start() {
  try {
    const channel = await connect();
    await connectDB()
    await consumeLiveQueue(channel);
    await consumePreviewScreenQueue(channel)

    httpServer.listen(PORT, () => {
      console.log(`🚀 Socket.IO server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();