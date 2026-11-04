const User = require('../models/User');

// هل المستخدم مسجّل دخول؟
function authenticate(req, res, next) {
  const { userId } = req.auth();
  if (!userId) {
    return res.status(401).json({ message: 'لازم تسجّل دخول الأول' });
  }
  next();
}

function getAdminIds() {
  return (process.env.ADMIN_CLERK_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

// يجيب (أو ينشئ) المستخدم من الداتابيز ويحدد الـ role
async function attachAppUser(req, res, next) {
  try {
    const { userId } = req.auth();
    const shouldBeAdmin = getAdminIds().includes(userId);

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      user = await User.create({
        clerkId: userId,
        role: shouldBeAdmin ? 'admin' : 'user',
      });
    } else if (shouldBeAdmin && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    req.appUser = user;
    next();
  } catch (error) {
    console.error('attachAppUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// يسمح فقط للأدمن
function isAdmin(req, res, next) {
  if (req.appUser?.role !== 'admin') {
    return res.status(403).json({ message: 'صلاحيات أدمن مطلوبة' });
  }
  next();
}

const adminOnly = [authenticate, attachAppUser, isAdmin];

module.exports = { authenticate, attachAppUser, isAdmin, adminOnly };