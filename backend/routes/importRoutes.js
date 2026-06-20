const express = require('express');
const router = express.Router();
const { importContacts, getImportStatus } = require('../controllers/importController');

// Mounted at /api. Start an import for a list, and poll a job's status by id.
router.post('/lists/:listId/import', importContacts);
router.get('/import/:id', getImportStatus);

module.exports = router;
