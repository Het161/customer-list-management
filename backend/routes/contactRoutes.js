const express = require('express');
const router = express.Router();
const {
  addContact,
  getContacts,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

router.get('/lists/:listId/contacts', getContacts);
router.post('/lists/:listId/contacts', addContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

module.exports = router;
