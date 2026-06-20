const List = require('../models/List');
const Contact = require('../models/Contact');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/lists
exports.createList = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    throw new ApiError(400, 'List name is required');
  }

  const list = await List.create({ name, description });
  res.status(201).json(list);
});

// GET /api/lists
exports.getLists = asyncHandler(async (req, res) => {
  const lists = await List.find().sort({ createdAt: -1 });
  res.json(lists);
});

// GET /api/lists/:id
exports.getList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) throw new ApiError(404, 'List not found');
  res.json(list);
});

// PUT /api/lists/:id
exports.updateList = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (name !== undefined && !name.trim()) {
    throw new ApiError(400, 'List name cannot be empty');
  }

  const list = await List.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true, runValidators: true }
  );
  if (!list) throw new ApiError(404, 'List not found');
  res.json(list);
});

// DELETE /api/lists/:id
exports.deleteList = asyncHandler(async (req, res) => {
  const list = await List.findByIdAndDelete(req.params.id);
  if (!list) throw new ApiError(404, 'List not found');

  // Keep the data consistent: a list's contacts should not outlive the list.
  await Contact.deleteMany({ listId: list._id });
  res.json({ message: 'List deleted' });
});
