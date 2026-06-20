require('dotenv').config();
const { Worker } = require('bullmq');
const connectDB = require('../config/db');
const connection = require('../config/redis');
const Contact = require('../models/Contact');
const ImportJob = require('../models/ImportJob');

// The worker runs as its own process, separate from the API, so it opens its
// own MongoDB connection.
connectDB();

const worker = new Worker(
  'contact-import',
  async (job) => {
    const { importJobId, listId, contacts } = job.data;

    // Mark the job as in-progress so the UI can reflect it immediately.
    await ImportJob.findByIdAndUpdate(importJobId, { status: 'Processing' });

    let inserted = 0;
    let duplicates = 0;
    let failed = 0;

    for (const c of contacts) {
      // Spec rule: phone is mandatory. Rows without one are counted as failed.
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
        // 11000 = Mongo duplicate-key error from the unique {listId, phone}
        // index. This also catches duplicates within the same import batch.
        if (err.code === 11000) duplicates++;
        else failed++;
      }
    }

    // Persist the final tally and mark the job done.
    await ImportJob.findByIdAndUpdate(importJobId, {
      status: 'Completed',
      inserted,
      duplicates,
      failed,
    });
  },
  { connection }
);

// Fires if the processor function itself throws (e.g. database unreachable),
// as opposed to a single bad contact row. Mark the whole job Failed.
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
