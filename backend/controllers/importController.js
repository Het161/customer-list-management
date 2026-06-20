const ImportJob = require('../models/ImportJob');
const List = require('../models/List');
const importQueue = require('../queues/importQueue');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/lists/:listId/import
exports.importContacts = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const { contacts } = req.body;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    throw new ApiError(400, 'contacts must be a non-empty array');
  }

  const listExists = await List.exists({ _id: listId });
  if (!listExists) throw new ApiError(404, 'List not found');

  // create the job record first so we can return an id to poll
  const job = await ImportJob.create({ listId, total: contacts.length });

  // worker does the actual inserts; respond without waiting for it
  await importQueue.add('import', {
    importJobId: job._id.toString(),
    listId,
    contacts,
  });

  res.status(202).json({ message: 'Import started', importJobId: job._id });
});

// GET /api/import/:id
exports.getImportStatus = asyncHandler(async (req, res) => {
  const job = await ImportJob.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Import job not found');
  res.json(job);
});
