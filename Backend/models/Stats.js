const { clerkClient } = require('@clerk/express');

router.get('/stats', authenticate, attachAppUser, isAdmin, async (req, res) => {
  const [moviesCount, bookingsCount, clerkUsersCount] = await Promise.all([
    Movie.countDocuments(),
    Booking.countDocuments(),
    clerkClient.users.getCount(),
  ]);

  res.json({ moviesCount, bookingsCount, usersCount: clerkUsersCount });
});