"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rabbitmq_1 = require("./services/rabbitmq");
const s3_1 = require("./services/s3");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const app_1 = require("./app");
const gallery_1 = __importDefault(require("./model/gallery"));
const consumeMessages = async (queue) => {
    const { channel } = await (0, rabbitmq_1.connectRabbitMQ)();
    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in ${queue}...`);
    await (0, app_1.connectDB)();
    channel.consume(queue, async (message) => {
        if (message) {
            try {
                console.log(`Received: ${message.content.toString()}`);
                const data = JSON.parse(message.content.toString());
                if (!data['paths']) {
                    return;
                }
                const photos = [];
                for (const path of data['paths']) {
                    const buffer = (0, fs_1.readFileSync)(path);
                    const key = `photos/${(0, crypto_1.randomUUID)()}.${path.split('.').pop()}`;
                    await (0, s3_1.putObject)(process.env.BUCKET, key, buffer);
                    photos.push(`https://${process.env.BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`);
                }
                const isExists = await gallery_1.default.exists({ user: data['user_id'] });
                if (!isExists) {
                    await gallery_1.default.create({
                        user: data["user_id"],
                        photos: photos
                    });
                }
                else {
                    await gallery_1.default.updateOne({ user: data['user_id'] }, {
                        $push: {
                            photos: photos
                        }
                    });
                }
                //Cleanup the images from storage
                for (const path of data['paths']) {
                    await fs_1.promises.rm(path);
                }
                channel.ack(message); // Acknowledge message
            }
            catch (e) {
                console.log(e);
                channel.ack(message);
            }
        }
    });
};
consumeMessages('upload-s3');
