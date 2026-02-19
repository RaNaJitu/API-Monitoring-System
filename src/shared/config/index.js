import dotenv from 'dotenv';

dotenv.config();

const config = {
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || 5000, 10),

  //MongoDB configuration
  mongo: {
    url: process.env.MONGO_URI || 'mongodb://localhost:27017/api_monitoring',
    dbName: process.env.MONGO_DB_NAME || 'api_monitoring',
  },

  //Database configuration
  postgres: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || 5432, 10),
    database: process.env.PG_DATABASE || 'api_monitoring',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
  },

  //RebitMQ configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'api_monitoring_queue',
    publisherConfirm: process.env.RABBITMQ_PUBLISHER_CONFIRM === 'true' || false, //MSG LOST
    retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || '1000', 10), // in milliseconds
  },

  jwt: {
    secret: process.env.JWT_SECRET || '6a32955ac9b821c16aaa56932707a9b8641124dffcff5e25c9150268966da768',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minute :: 1 minute = 60000 ms
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  }
};

export default config;

