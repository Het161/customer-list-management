const express = require('express');
const router = express.Router();
const {
  createList,
  getLists,
  getList,
  updateList,
  deleteList,
} = require('../controllers/listController');

// Mounted at /api/lists
router.post('/', createList);
router.get('/', getLists);
router.get('/:id', getList);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

module.exports = router;
