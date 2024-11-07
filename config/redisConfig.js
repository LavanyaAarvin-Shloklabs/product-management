const redis = require('redis');
const logger = require('../logger')(module)


// Create the client and connect asynchronously
const client = redis.createClient({ url: 'redis://localhost:6379' });

client.on('error', (err) => {
    logger.debug('Redis Client Error', err);
});

async function connectRedis() {
    try {
        await client.connect(); // Make sure connection happens before any operations
        logger.debug('Connected to Redis');
    } catch (err) {
        logger.error('Redis connection failed', err);
    }
}

connectRedis(); // Call the connection function

module.exports = client;
