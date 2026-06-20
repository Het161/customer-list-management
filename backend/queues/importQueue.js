const { Queue } = require('bullmq');
const connection = require('../config/redis');

// Producer side of the queue. Controllers import this and call importQueue.add()
// to enqueue a job; the worker (workers/importWorker.js) consumes the same queue.
// The name 'contact-import' must match on both sides.
const importQueue = new Queue('contact-import', { connection });

module.exports = importQueue;
