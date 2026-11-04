const express = require('express');
const router = express.Router();
const { clerkClient } = require('@clerk/express');

const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { adminOnly } = require('../middleware/auth');

// كل routes في الملف ده للأدمن فقط
router.use(adminOnly);

// ───────── دوال مساعدة ─────────

function listData(result) {
  return Array.isArray(result) ? result : result?.data || [];
}

// الأدمن الأساسيين (المكتوبين في .env) - ما ينفعش يتنزّلوا من الداشبورد
function getOwnerIds() {
  return (process.env.ADMIN_CLERK_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

function pickEmail(u) {
  const primary = u.emailAddresses?.find((e) => e.id === u.primaryEmailAddressId);
  return (primary || u.emailAddresses?.[0])?.emailAddress || '';
}

function toPublicUser(u) {
  const name =
    [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '';
  return {
    clerkId: u.id,
    name,
    email: pickEmail(u),
    imageUrl: u.imageUrl || '',
    createdAt: u.createdAt,
    banned: !!u.banned,
  };
}

async function getClerkUsersMap(clerkIds) {
  const ids = [...new Set(clerkIds)].slice(0, 500);
  if (!ids.length) return new Map();

  const result = await clerkClient.users.getUserList({
    userId: ids,
    limit: ids.length,
  });

  return new Map(listData(result).map((u) => [u.id, toPublicUser(u)]));
}

// ───────── GET /api/admin/stats ─────────
router.get('/stats', async (req, res) => {
  try {
    const [activeShows, totalBookings, revenueAgg, totalUsers] =
      await Promise.all([
        Movie.countDocuments(),
        Booking.countDocuments({ status: 'confirmed' }),
        Booking.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),
        clerkClient.users.getCount().catch(() => User.countDocuments()),
      ]);

    res.json({
      activeShows,
      totalBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Could not load stats' });
  }
});

// ───────── GET /api/admin/users ─────────
router.get('/users', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const owners = getOwnerIds();

    const clerkResult = await clerkClient.users.getUserList({
      limit,
      orderBy: '-created_at',
    });
    const clerkUsers = listData(clerkResult);

    const dbUsers = await User.find({
      clerkId: { $in: clerkUsers.map((u) => u.id) },
    }).select('clerkId role');

    const dbByClerkId = new Map(dbUsers.map((u) => [u.clerkId, u]));

    const totals = await Booking.aggregate([
      {
        $match: {
          status: 'confirmed',
          user: { $in: dbUsers.map((u) => u._id) },
        },
      },
      {
        $group: {
          _id: '$user',
          bookings: { $sum: 1 },
          spent: { $sum: '$totalPrice' },
        },
      },
    ]);
    const totalsByDbId = new Map(totals.map((t) => [String(t._id), t]));

    res.json(
      clerkUsers.map((u) => {
        const db = dbByClerkId.get(u.id);
        const t = db && totalsByDbId.get(String(db._id));
        const isOwner = owners.includes(u.id);
        return {
          ...toPublicUser(u),
          role: isOwner ? 'admin' : db?.role || 'user',
          owner: isOwner,
          bookings: t?.bookings || 0,
          spent: t?.spent || 0,
        };
      })
    );
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Could not load users' });
  }
});

// ───────── GET /api/admin/bookings ─────────
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('user', 'clerkId')
      .populate({
        path: 'showtime',
        select: 'time hall showday',
        populate: {
          path: 'showday',
          select: 'date movie',
          populate: { path: 'movie', select: 'title' },
        },
      })
      .lean();

    const usersMap = await getClerkUsersMap(
      bookings.map((b) => b.user?.clerkId).filter(Boolean)
    );

    res.json(
      bookings.map((b) => {
        const u = usersMap.get(b.user?.clerkId);
        const st = b.showtime;
        return {
          _id: b._id,
          user: {
            name: u?.name || '',
            email: u?.email || '',
            imageUrl: u?.imageUrl || '',
          },
          movie: st?.showday?.movie?.title || 'Deleted show',
          date: st?.showday?.date || null,
          time: st?.time || '',
          hall: st?.hall || '',
          seats: b.seats,
          totalPrice: b.totalPrice,
          status: b.status,
          createdAt: b.createdAt,
        };
      })
    );
  } catch (error) {
    console.error('Admin bookings error:', error);
    res.status(500).json({ message: 'Could not load bookings' });
  }
});

// ───────── حماية: مين مسموح نتصرف فيه؟ ─────────
// ممنوع: نفسك، الأدمن الأساسي، أو أي أدمن (لازم تشيل صلاحيته الأول)
async function guardTarget(req, res) {
  const targetId = req.params.clerkId;

  if (targetId === req.auth().userId) {
    res.status(400).json({ message: 'لا يمكنك تنفيذ هذا الإجراء على نفسك' });
    return false;
  }

  const target = await User.findOne({ clerkId: targetId }).select('role');

  if (getOwnerIds().includes(targetId) || target?.role === 'admin') {
    res.status(403).json({
      message: 'هذا المستخدم أدمن. شيل صلاحية الأدمن منه الأول',
    });
    return false;
  }

  return true;
}

// POST /api/admin/users/:clerkId/ban
router.post('/users/:clerkId/ban', async (req, res) => {
  try {
    if (!(await guardTarget(req, res))) return;
    await clerkClient.users.banUser(req.params.clerkId);
    res.json({ message: 'تم حظر المستخدم' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Could not block user' });
  }
});

// POST /api/admin/users/:clerkId/unban
router.post('/users/:clerkId/unban', async (req, res) => {
  try {
    if (!(await guardTarget(req, res))) return;
    await clerkClient.users.unbanUser(req.params.clerkId);
    res.json({ message: 'تم فك الحظر' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ message: 'Could not unblock user' });
  }
});

// POST /api/admin/users/:clerkId/role   body: { role: 'admin' | 'user' }
router.post('/users/:clerkId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const targetId = req.params.clerkId;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (targetId === req.auth().userId) {
      return res.status(400).json({ message: 'لا يمكنك تغيير صلاحيتك أنت' });
    }

    if (getOwnerIds().includes(targetId)) {
      return res
        .status(403)
        .json({ message: 'هذا أدمن أساسي (محدد في .env) ولا يمكن تغييره' });
    }

    // upsert: لو المستخدم عمره ما دخل الموقع وملوش سجل في الداتابيز
    const user = await User.findOneAndUpdate(
      { clerkId: targetId },
      { $set: { role } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ role: user.role });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ message: 'Could not change role' });
  }
});

// DELETE /api/admin/users/:clerkId  (حذف نهائي من Clerk)
router.delete('/users/:clerkId', async (req, res) => {
  try {
    if (!(await guardTarget(req, res))) return;
    await clerkClient.users.deleteUser(req.params.clerkId);
    res.json({ message: 'تم حذف المستخدم' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Could not delete user' });
  }
});

module.exports = router;