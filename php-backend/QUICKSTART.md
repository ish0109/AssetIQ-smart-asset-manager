# Quick Start

## 1. Start the backend

```bash
cd php-backend/public
php -S localhost:8000
```

## 2. Create a user

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"you@example.com\",\"password\":\"secure123\"}"
```

## 3. Log in

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"you@example.com\",\"password\":\"secure123\"}"
```

## 4. Open the frontend

Run the Next.js app and sign in from the `/login` page.

## Required env vars

```env
MONGODB_URI=...
MONGODB_DB=...
```
