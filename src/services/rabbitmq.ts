import amqp from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.AMQPURL!);
        const channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
        return { connection, channel };
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
};


export const produceMessageToQueue = async (queue: string, message: string) => {
    const { channel } = await connectRabbitMQ();
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Message sent to ${queue}:`, message);
};
