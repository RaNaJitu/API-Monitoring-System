import ampq from "amqplib";
import logger from "./logger.js";
import config from "./index.js";

class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
    }

    async connect() {
        if (this.channel) {
            logger.info("RabbitMQ Channel Already Created");
            return this.channel;
        }
        if (this.isConnecting) {
            await new Promise((resolve) => {
                const checkConnection = setInterval(() => {
                    if (this.connection) {
                        clearInterval(checkConnection);
                        resolve();
                    }
                }, 100);
            });
            logger.info("RabbitMQ Already Connected");
            return this.channel;
        }
        try {
            this.isConnecting = true;
            logger.info(`Connecting to RabbitMQ: ${config.rabbitmq.url}`);
            this.connection = await ampq.connect(config.rabbitmq.url);
            this.channel = await this.connection.createChannel();

            // creating Key Dead Letter Queue (DLQ) for the main queue
            const dlqName = `${config.rabbitmq.queue}_dlq`;

            //DL Queue
            await this.channel.assertQueue(config.rabbitmq.queue, {
                durable: true,
                // arguments: {
                //   "x-dead-letter-exchange": "",
                //   "x-dead-letter-routing-key": dlqName,
                // },
            });

            // Normal Queue
            await this.channel.assertQueue(dlqName, {
                durable: true,
                arguments: {
                    "x-dead-letter-exchange": "",
                    "x-dead-letter-routing-key": dlqName,
                },
            });
            logger.info(`RabbitMQ Connected, queue: ${config.rabbitmq.queue}`);

            this.connection.on("close", () => {
                logger.warn("RabbitMQ Connection Closed");
                this.connection = null;
                this.channel = null;
            });

            this.connection.on("error", (err) => {
                logger.error(`RabbitMQ Connection Error: ${err}`);
                this.connection = null;
                this.channel = null;
            });

            this.isConnecting = false;
            return this.channel;
        } catch (error) {
            logger.error(`Error connecting to RabbitMQ: ${error}`);
            throw error;
        }
    }

    getChannel() {
        if (!this.channel) {
            logger.error("RabbitMQ is not connected. Please call connect() first.");
        }
        return this.channel;
    }

    getStatus() {
        if (!this.connection || !this.channel) {
            return "disconnected";
        } else if (!this.connection.closed) {
            return "closing";
        } else {
            return "connected";
        }
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
                logger.info("RabbitMQ Channel Closed Successfully");
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
                logger.info("RabbitMQ Connection Closed Successfully");
            }
        } catch (error) {
            logger.error(`Error closing RabbitMQ connection: ${error}`);
            throw error;
        }
    }
}

export default new RabbitMQConnection();
