const express = require('express');
const router = express.Router();
const { importContacts, getImportStatus } = require('../controllers/importController');

router.post('/lists/:listId/import', importContacts);
router.get('/import/:id', getImportStatus);

module.exports = router;
