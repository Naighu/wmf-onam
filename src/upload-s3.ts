import { connectRabbitMQ } from "./services/rabbitmq";
import { putObject } from "./services/s3";
import { promises, readFileSync } from "fs";
import { randomUUID } from "crypto";
import Gallery from "./model/gallery";
import { Channel } from "amqplib";
import { connectDB } from "./services/mongodb";

const connect = async () => {
    const { channel } = await connectRabbitMQ();
    return channel
}


const upload_s3_queue = async (channel: Channel) => {
    const queue = "upload-s3"

    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in ${queue}...`);
    await connectDB()

    channel.consume(queue, async (message) => {
        if (message) {
            try {
                console.log(`Received: ${message.content.toString()}`);
                const data = JSON.parse(message.content.toString())

                if (!data['paths']) {
                    return
                }

                const photos = []
                for (const path of data['paths']) {
                    const buffer = readFileSync(path);
                    const key = `photos/${randomUUID()}.${path.split('.').pop()}`;
                    await putObject(process.env.BUCKET!, key, buffer)
                    photos.push(`https://${process.env.BUCKET!}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`)
                }

                const isExists = await Gallery.exists({ user: data['user_id'] })

                if (!isExists) {
                    await Gallery.create({
                        user: data["user_id"],
                        photos: photos
                    })
                } else {
                    await Gallery.updateOne({ user: data['user_id'] }, {
                        $push: {
                            photos: photos
                        }
                    })
                }

                //Cleanup the images from storage
                for (const path of data['paths']) {
                    await promises.rm(path)
                }
                channel.ack(message); // Acknowledge message
            } catch (e) {
                console.log(e);
                channel.ack(message);
            }
        }
    });
};




connect().then((channel) => {
    upload_s3_queue(channel);

})