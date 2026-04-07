# PHP Backend - Transaction Dashboard

This backend serves the transaction dashboard API and now uses MongoDB for user authentication.

## Features

- MongoDB-backed user signup and login
- PHP session-based route protection
- Transaction CRUD endpoints
- Dashboard stats, recent items, and category breakdown

## Required Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB=transaction_dashboard
API_BASE_URL=http://localhost:8000/php-backend/public
DEBUG_MODE=true
SESSION_TIMEOUT=3600
```

## Users Collection

The backend uses a `users` collection with this schema:

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password": "hashed-password",
  "created_at": "Date"
}
```

A unique index is created on `email`.

## Auth Endpoints

### `POST /api/auth/signup`

Request body:

```json
{
  "email": "user@example.com",
  "password": "secure123"
}
```

Rules:

- Email must be present and valid
- Password must be at least 6 characters
- Duplicate email addresses are rejected

### `POST /api/auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "secure123"
}
```

The backend loads the user from MongoDB and verifies the hashed password with `password_verify`.

### `POST /api/auth/logout`

Ends the current PHP session.

### `GET /api/auth/user`

Returns the current authenticated user from the session.

## Protected Routes

These routes require a logged-in session:

- `/api/transactions`
- `/api/transactions/:id`
- `/api/dashboard/stats`
- `/api/dashboard/recent`
- `/api/dashboard/categories`

## Running Locally

```bash
cd php-backend/public
php -S localhost:8000
```

## Troubleshooting

### MongoDB connection fails

- Verify `MONGODB_URI`
- Verify `MONGODB_DB`
- Make sure MongoDB Atlas allows connections from your current IP
- Confirm the PHP MongoDB extension is installed
