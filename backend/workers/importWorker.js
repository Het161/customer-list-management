require('dotenv').config();
const { Worker } = require('bullmq');
const connectDB = require('../config/db');
const connection = require('../config/redis');
const Contact = require('../models/Contact');
const ImportJob = require('../models/ImportJob');

// separate process from the API, so it needs its own db connection
connectDB();

const worker = new Worker(
  'contact-import',
  async (job) => {
    const { importJobId, listId, contacts } = job.data;

    await ImportJob.findByIdAndUpdate(importJobId, { status: 'Processing' });

    let inserted = 0;
    let duplicates = 0;
    let failed = 0;

    for (const c of contacts) {
      if (!c.phone || !String(c.phone).trim()) {
        failed++;
        continue;
      }

      try {
        await Contact.create({
          listId,
          name: c.name,
          phone: String(c.phone).trim(),
          email: c.email,
        });
        inserted++;
      } catch (err) {
        // 11000 = duplicate phone in this list (also catches dupes inside the batch)
        if (err.code === 11000) duplicates++;
        else failed++;
      }
    }

    await ImportJob.findByIdAndUpdate(importJobId, {
      status: 'Completed',
      inserted,
      duplicates,
      failed,
    });
  },
  { connection }
);

// only fires if the whole job throws (e.g. db down), not for a single bad row
worker.on('failed', async (job, err) => {
  console.error(`Import job ${job?.id} failed:`, err.message);
  if (job?.data?.importJobId) {
    await ImportJob.findByIdAndUpdate(job.data.importJobId, { status: 'Failed' });
  }
});

worker.on('completed', (job) => {
  console.log(`Import job ${job.id} completed`);
});

console.log('Import worker started, waiting for jobs...');
