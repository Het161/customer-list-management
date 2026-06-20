const IORedis = require('ioredis');

// Shared Redis connection for BullMQ (both the queue and the worker use this).
// maxRetriesPerRequest: null is required by BullMQ for its blocking commands.
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

module.exports = connection;
