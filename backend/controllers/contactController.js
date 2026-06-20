const Contact = require('../models/Contact');
const List = require('../models/List');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/lists/:listId/contacts
exports.addContact = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const { name, phone, email } = req.body;

  if (!name || !name.trim()) throw new ApiError(400, 'Name is required');
  if (!phone || !phone.trim()) throw new ApiError(400, 'Phone is required');

  const listExists = await List.exists({ _id: listId });
  if (!listExists) throw new ApiError(404, 'List not found');

  const contact = await Contact.create({ listId, name, phone, email });
  res.status(201).json(contact);
});

// GET /api/lists/:listId/contacts?search=term
exports.getContacts = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const { search } = req.query;

  const filter = { listId };
  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }];
  }

  const contacts = await Contact.find(filter).sort({ createdAt: -1 });
  res.json(contacts);
});

// PUT /api/contacts/:id
exports.updateContact = asyncHandler(async (req, res) => {
  const { name, phone, email } = req.body;
  if (phone !== undefined && !phone.trim()) {
    throw new ApiError(400, 'Phone cannot be empty');
  }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { name, phone, email },
    { new: true, runValidators: true }
  );
  if (!contact) throw new ApiError(404, 'Contact not found');
  res.json(contact);
});

// DELETE /api/contacts/:id
exports.deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) throw new ApiError(404, 'Contact not found');
  res.json({ message: 'Contact deleted' });
});

// escape user input so regex chars (. + * etc.) are matched literally
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
