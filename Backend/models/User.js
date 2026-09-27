const mongoose = require('mongoose');

// Clerk handles auth/identity entirely. This model only stores the
// app-specific data Clerk doesn't: the role used for admin checks.
const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
