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

// no duplicate phone within the same list (same number can exist in other lists)
contactSchema.index({ listId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Contact', contactSchema);
