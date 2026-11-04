const express = require('express');
const router = express.Router();
const { authenticate, attachAppUser } = require('../middleware/auth');

// GET /api/me  → الفرونت يسأل: أنا أدمن ولا لأ؟
router.get('/me', authenticate, attachAppUser, (req, res) => {
  res.json({ role: req.appUser.role, isAdmin: req.appUser.role === 'admin' });
});

module.exports = router;