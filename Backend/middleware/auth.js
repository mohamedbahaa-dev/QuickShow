const { requireAuth } = require('@clerk/express');
const User = require('../models/User');

// Verifies the session token Clerk issues to the frontend.
// After this runs, req.auth.userId holds the Clerk user id.
const authenticate = requireAuth();

// Looks up (or lazily creates) the matching app-side User document,
// and attaches it to req.appUser so routes can check req.appUser.role.
async function attachAppUser(req, res, next) {
  const { userId } = req.auth;
  let user = await User.findOne({ clerkId: userId });
  if (!user) {
    user = await User.create({ clerkId: userId, role: 'user' });
  }
  req.appUser = user;
  next();
}

function isAdmin(req, res, next) {
  if (req.appUser?.role !== 'admin') {
    return res.status(403).json({ message: 'صلاحيات أدمن مطلوبة' });
  }
  next();
}

module.exports = { authenticate, attachAppUser, isAdmin };
