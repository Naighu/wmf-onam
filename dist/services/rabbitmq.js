"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.produceMessageToQueue = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectRabbitMQ = async () => {
    try {
        const connection = await amqplib_1.default.connect(process.env.AMQPURL);
        const channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
        return { connection, channel };
    }
    catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
const produceMessageToQueue = async (queue, message) => {
    const { channel } = await (0, exports.connectRabbitMQ)();
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Message sent to ${queue}:`, message);
};
exports.produceMessageToQueue = produceMessageToQueue;
