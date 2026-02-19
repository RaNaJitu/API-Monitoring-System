import mongoose from "mongoose";
import config from "./index";
import logger from "./logger";

/*Three type of Design pattern for database connection
1. Creational pattern: Singleton, Factory, Builder, Abstract Factory
2. Structural pattern: Adapter, Facade, Proxy, Decorator, Composite
3. Behavioral pattern: Observer, Strategy, Command, Iterator, Mediator, Memento, State, Template Method, Visitor
*/

/**
 * MongoDB database manager/connector
 */
class MongoConnection {
    constructor() {
        this.connection = null;
    }

    /**
     * connect to MongoDB using Mongoose
     * @returns  {Promise<mongoose.connection>}
     */
    async connect() {
        try {
          if (this.connection) {
              logger.info("MongoDB Already Connected");
                return this.connection;
            }
            this.connection = await mongoose.connect(config.mongo.url, {
                // useNewUrlParser: true,
                // useUnifiedTopology: true,
                dbName: config.mongo.dbName,
            });
            this.connection = mongoose.connection;
            
            logger.info(`MongoDB Connected Successfully: ${config.mongo.url}`);
            
            this.connection.on('error', (err) => {
                logger.error(`MongoDB Connection Error: ${err}`);
            });
            
            this.connection.on('disconnected', () => {
                logger.warn('MongoDB Disconnected');
            });
          
            return this.connection;
            
        } catch (error) {
            logger.error(`Error connecting to MongoDB: ${error}`);
            throw error;
        }
    }
  /**
   * help to disconnect from MongoDB
   */
  async disconnect() {
    try {
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
        logger.info("MongoDB Disconnected");
      }
    } catch (error) {
      logger.error(`Failed to disconnect from MongoDB: ${error}`);
      throw error;
    }
  }
  /**
   * Get the current MongoDB connection instance
   * @returns {mongoose.connection} current MongoDB connection instance
   */
  getConnection() {
    if (!this.connection) {
      logger.error("MongoDB is not connected. Please call connect() first.");
    }
    return this.connection;
  }
}

export default new MongoConnection();