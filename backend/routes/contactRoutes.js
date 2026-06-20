const express = require('express');
const router = express.Router();
const {
  addContact,
  getContacts,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

// Mounted at /api. Contacts always belong to a list, so create/list are nested
// under a list id. Update/delete act on a single contact by its own id.
router.get('/lists/:listId/contacts', getContacts);
router.post('/lists/:listId/contacts', addContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

module.exports = router;
