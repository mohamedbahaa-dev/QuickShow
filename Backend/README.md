# Cinema Booking Backend

Node.js + Express + MongoDB backend for a cinema booking website.
Authentication and user sessions are handled by **Clerk** — this backend
never issues its own tokens or stores passwords.

## Setup

```bash
npm install
cp .env.example .env
# fill in MONGO_URI, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, FRONTEND_URL
npm run dev
```

Get `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` from your Clerk dashboard →
API Keys. The frontend must be a Clerk-enabled app so it can send a valid
session token with each request.

## Data model

`Movie → Showday → Showtime → (SeatHold | Booking)`

- **Movie** – static movie info, admin adds these so they appear on the site.
- **Showday** – a date a movie is showing.
- **Showtime** – a specific session (time/hall) with `bookedSeats` (confirmed forever).
- **SeatHold** – a temporary hold placed the instant a user clicks a seat.
  Auto-deleted by MongoDB itself via a TTL index once `expiresAt` passes.
- **Booking** – the final confirmed booking record, created after payment.
- **User** – *not* an auth table. Just links a Clerk `clerkId` to an
  app-specific `role` (`user` / `admin`), since Clerk doesn't know your
  app's roles. Created lazily the first time a Clerk user hits an
  authenticated route.

## Auth flow with Clerk

1. Frontend user signs in through Clerk's own UI components — this backend
   is never involved in login/register.
2. Frontend attaches the Clerk session token to every request:
   `Authorization: Bearer <token from useAuth().getToken()>`.
3. `clerkMiddleware()` (mounted globally in `server.js`) reads that token
   and populates `req.auth` on every request.
4. Protected routes use `authenticate` (`requireAuth()` from `@clerk/express`)
   to reject unauthenticated requests, then `attachAppUser` to look up (or
   create) the matching MongoDB `User` and attach it as `req.appUser`.
5. Admin-only routes additionally use `isAdmin`, which checks
   `req.appUser.role === 'admin'`.

### Making someone an admin

There's no signup flow for this — promote a user manually, either:
- directly in MongoDB: `db.users.updateOne({ clerkId }, { $set: { role: 'admin' } })`, or
- by checking Clerk's `publicMetadata.role` instead, if you'd rather manage
  roles from the Clerk dashboard (swap the check inside `isAdmin` accordingly).

## Endpoints

| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | /api/movies | anyone | list movies for the site |
| POST | /api/movies | admin | add a movie |
| PUT/DELETE | /api/movies/:id | admin | edit/remove a movie |
| GET | /api/movies/:movieId/showdays | anyone | available days for a movie |
| POST | /api/movies/:movieId/showdays | admin | add a showing day |
| GET | /api/showdays/:showdayId/showtimes | anyone | showtimes for a day |
| POST | /api/showdays/:showdayId/showtimes | admin | add a showtime |
| GET | /api/showtimes/:id/seats | anyone | booked seats + currently held seats |
| POST | /api/holds | logged-in user | temporarily hold seats (5 min default) |
| POST | /api/bookings/confirm | logged-in user | finalize booking after payment |
| GET | /api/bookings/me | logged-in user | booking history |

## Concurrency handling (two users clicking the same seat)

1. Holding a seat uses `SeatHold.insertMany` protected by a unique
   `(showtime, seat)` index — if two requests race, MongoDB itself rejects
   the second one with a duplicate-key error, turned into a 409 response.
2. Holds expire automatically via `expireAfterSeconds: 0` on `expiresAt` —
   MongoDB removes the document on its own; nothing in the app "returns"
   the seat manually.
3. Final confirmation uses `findOneAndUpdate` with a `$nin` guard on
   `bookedSeats`, so moving a seat from "held" to "permanently booked" is
   also a single atomic database operation.

## Admin dashboard

No separate endpoints — the dashboard frontend calls the same POST/PUT/DELETE
routes above with a signed-in admin's Clerk token.
