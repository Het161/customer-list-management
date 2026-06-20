const { Queue } = require('bullmq');
const connection = require('../config/redis');

// Producer side of the queue.
const importQueue = new Queue('contact-import', { connection });

module.exports = importQueue;
