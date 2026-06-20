const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
  },
  { timestamps: true }
);

// A phone number must be unique within a single list, but the same number is
// allowed to appear in different lists. A compound unique index enforces that
// at the database level, so duplicates are rejected even under concurrent writes.
contactSchema.index({ listId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Contact', contactSchema);
