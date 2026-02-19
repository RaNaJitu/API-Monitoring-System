
import pg from "pg";
import logger from "./logger.js";
import config from "./index.js";

/**
 * PostgreSQL database manager/connector
 */
class PostgresConnection {
    constructor() {
        this.pool = null;
    }
    /**
     * Get the PostgreSQL connection pool instance
     * @returns {pg.Pool} PostgreSQL connection pool instance
     */
    getPool() {
        if (!this.pool) {
            this.pool = new pg.Pool({
                connectionString: process.env.DATABASE_URL,
                host: config.postgres.host,
                port: config.postgres.port,
                user: config.postgres.user,
                password: config.postgres.password,
                database: config.postgres.database,
                max: 20, // maximum number of clients in the pool
                idleTimeoutMillis: 30000, // close idle clients after 30 seconds
                connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
            });

            this.pool.on("error", (err) => {
                logger.error(`PostgreSQL Pool Error: ${err}`);
            });
        }
        logger.info("PostgreSQL is connected.");
        return this.pool;
    }

    /**
     * Test the PostgreSQL connection by executing a simple query
     * @returns {Promise<void>}
     */
    async testConnection() {
        try {
            const pool = this.getPool();
            const client = await pool.connect();
            const result = await client.query("SELECT NOW()");
            client.release();

            logger.info(
                `PostgreSQL Test Connection Successful: ${result.rows[0].now}`
            );
        } catch (error) {
            logger.error(`PostgreSQL Test Connection Error: ${error}`);
            throw error;
        }
    }

    /**
     * Execute a query against the PostgreSQL database
     * @param {string} text - The SQL query text
     * @param {Array} params - The parameters for the query
     * @returns {Promise<pg.QueryResult>} - The result of the query
     */
    async query(text, params) {
        const pool = this.getPool();
        const start = Date.now();
        try {
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            logger.info(
                `PostgreSQL Query Executed: ${text} with params ${JSON.stringify(
                    params
                )} in ${duration}ms`
            );
            return res;
        } catch (error) {
            logger.error(`PostgreSQL Query Error: ${error}`);
            throw error;
        }
    }

    /**
     * Close the PostgreSQL connection pool
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (this.pool) {
            try {
                await this.pool.end();
                this.pool = null;
                logger.info("PostgreSQL Pool has ended.");
            } catch (error) {
                logger.error(`Error ending PostgreSQL Pool: ${error}`);
                throw error;
            }
        }
    }
}

export default new PostgresConnection();
