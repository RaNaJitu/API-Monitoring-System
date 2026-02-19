import winston from 'winston';
import config  from './index.js';

/**
 * Logger configuration using Winston
 * Logs are stored in 'logs' directory with separate files for errors and combined logs
 * Console logging is enabled for non-production environments with colorized output
 */
const logger = winston.createLogger({
  level: config.node_env === 'production' ? 'info' : 'debug',
   format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (config.node_env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;