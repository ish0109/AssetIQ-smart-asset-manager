# API Usage Examples

This document provides curl and JavaScript examples for all PHP backend API endpoints.

## Setup

Start the PHP server:
```bash
cd php-backend/public
php -S localhost:8000
```

Base URL: `http://localhost:8000`

## Authentication

### Login

**Curl:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Pass@123"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'Pass@123'
  }),
  credentials: 'include' // Include cookies for session
});

const data = await response.json();
console.log(data);
// { success: true, user: { name: 'Admin User', email: 'admin@example.com' } }
```

**Response:**
```json
{
  "success": true,
  "user": {
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

### Logout

**Curl:**
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Content-Type: application/json"
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:8000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});

const data = await response.json();
console.log(data);
// { success: true }
```

### Get Current User

**Curl:**
```bash
curl http://localhost:8000/api/auth/user
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:8000/api/auth/user', {
  credentials: 'include'
});

const data = await response.json();
console.log(data);
// { user: { name: 'Admin User', email: 'admin@example.com' } }
```

## Transactions

### Get All Transactions

**Curl:**
```bash
# Get all transactions
curl http://localhost:8000/api/transactions

# Filter by type
curl 'http://localhost:8000/api/transactions?type=expense'

# Filter by category
curl 'http://localhost:8000/api/transactions?category=Food%20%26%20Dining'

# Search by description
curl 'http://localhost:8000/api/transactions?search=grocery'

# Combine filters
curl 'http://localhost:8000/api/transactions?type=expense&category=Food%20%26%20Dining&limit=50'
```

**JavaScript:**
```javascript
// Get all transactions
let response = await fetch('http://localhost:8000/api/transactions');
let transactions = await response.json();

// With filters
const params = new URLSearchParams();
params.append('type', 'expense');
params.append('category', 'Food & Dining');
params.append('limit', '50');

response = await fetch(`http://localhost:8000/api/transactions?${params}`);
transactions = await response.json();
console.log(transactions);
```

**Response:**
```json
[
  {
    "id": "1",
    "type": "income",
    "amount": 5000,
    "category": "Salary",
    "description": "Monthly Salary",
    "date": "2024-03-24",
    "created_at": "2024-03-29T10:00:00+00:00",
    "updated_at": "2024-03-29T10:00:00+00:00"
  },
  {
    "id": "2",
    "type": "expense",
    "amount": 150,
    "category": "Food & Dining",
    "description": "Weekly Groceries",
    "date": "2024-03-25",
    "created_at": "2024-03-29T10:00:00+00:00",
    "updated_at": "2024-03-29T10:00:00+00:00"
  }
]
```

### Get Transaction by ID

**Curl:**
```bash
curl http://localhost:8000/api/transactions/1
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:8000/api/transactions/1');
const transaction = await response.json();
console.log(transaction);
```

**Response:**
```json
{
  "id": "1",
  "type": "income",
  "amount": 5000,
  "category": "Salary",
  "description": "Monthly Salary",
  "date": "2024-03-24",
  "created_at": "2024-03-29T10:00:00+00:00",
  "updated_at": "2024-03-29T10:00:00+00:00"
}
```

### Create Transaction

**Curl:**
```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 45.99,
    "category": "Food & Dining",
    "description": "Lunch at cafe",
    "date": "2024-03-29"
  }'
```

**JavaScript:**
```javascript
const newTransaction = {
  type: 'expense',
  amount: 45.99,
  category: 'Food & Dining',
  description: 'Lunch at cafe',
  date: '2024-03-29'
};

const response = await fetch('http://localhost:8000/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newTransaction)
});

const created = await response.json();
console.log(created);
```

**Response (201 Created):**
```json
{
  "id": "11",
  "type": "expense",
  "amount": 45.99,
  "category": "Food & Dining",
  "description": "Lunch at cafe",
  "date": "2024-03-29",
  "created_at": "2024-03-29T14:30:00+00:00",
  "updated_at": "2024-03-29T14:30:00+00:00"
}
```

### Update Transaction

**Curl:**
```bash
curl -X PUT http://localhost:8000/api/transactions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 5500,
    "category": "Salary",
    "description": "Monthly Salary (Updated)",
    "date": "2024-03-24"
  }'
```

**JavaScript:**
```javascript
const updated = {
  type: 'income',
  amount: 5500,
  category: 'Salary',
  description: 'Monthly Salary (Updated)',
  date: '2024-03-24'
};

const response = await fetch('http://localhost:8000/api/transactions/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updated)
});

const transaction = await response.json();
console.log(transaction);
```

**Response:**
```json
{
  "id": "1",
  "type": "income",
  "amount": 5500,
  "category": "Salary",
  "description": "Monthly Salary (Updated)",
  "date": "2024-03-24",
  "created_at": "2024-03-29T10:00:00+00:00",
  "updated_at": "2024-03-29T14:35:00+00:00"
}
```

### Delete Transaction

**Curl:**
```bash
curl -X DELETE http://localhost:8000/api/transactions/1
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:8000/api/transactions/1', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
// { success: true }
```

**Response:**
```json
{
  "success": true
}
```

## Dashboard

### Get Statistics

**Curl:**
```bash
curl http://localhost:8000/api/dashboard/stats
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:8000/api/dashboard/stats');
const stats = await response.json();
console.log(stats);
```

**Response:**
```json
{
  "income": 5750,
  "expense": 860,
  "balance": 4890
}
```

### Get Recent Transactions

**Curl:**
```bash
curl http://localhost:8000/api/dashboard/recent
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:8000/api/dashboard/recent');
const recent = await response.json();
console.log(recent);
```

**Response:**
```json
[
  {
    "id": "7",
    "type": "expense",
    "amount": 120,
    "category": "Shopping",
    "description": "New headphones",
    "date": "2024-03-29",
    "created_at": "2024-03-29T10:00:00+00:00",
    "updated_at": "2024-03-29T10:00:00+00:00"
  },
  {
    "id": "6",
    "type": "expense",
    "amount": 50,
    "category": "Entertainment",
    "description": "Movie tickets",
    "date": "2024-03-29",
    "created_at": "2024-03-29T10:00:00+00:00",
    "updated_at": "2024-03-29T10:00:00+00:00"
  }
]
```

### Get Category Breakdown

**Curl:**
```bash
curl http://localhost:8000/api/dashboard/categories
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:8000/api/dashboard/categories');
const categories = await response.json();
console.log(categories);
```

**Response:**
```json
[
  {
    "category": "Utilities",
    "total": 200
  },
  {
    "category": "Healthcare",
    "total": 300
  },
  {
    "category": "Food & Dining",
    "total": 235
  },
  {
    "category": "Transportation",
    "total": 75
  }
]
```

## Error Responses

### 400 Bad Request

**Missing fields:**
```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"type": "expense"}'
```

**Response:**
```json
{
  "error": "Missing required fields"
}
```

### 404 Not Found

**Invalid transaction ID:**
```bash
curl http://localhost:8000/api/transactions/invalid-id
```

**Response:**
```json
{
  "error": "Transaction not found"
}
```

### 405 Method Not Allowed

**Wrong HTTP method:**
```bash
curl -X POST http://localhost:8000/api/auth/user
```

**Response:**
```json
{
  "error": "Method not allowed"
}
```

### 500 Internal Server Error

**Server error (e.g., database connection failed):**
```json
{
  "error": "Failed to fetch transactions"
}
```

## Quick Test Script

Save as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

echo "1. Testing Login..."
LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Pass@123"}')
echo $LOGIN
echo ""

echo "2. Testing Get Transactions..."
curl -s $BASE_URL/api/transactions | jq .
echo ""

echo "3. Testing Create Transaction..."
CREATE=$(curl -s -X POST $BASE_URL/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"expense",
    "amount":99.99,
    "category":"Shopping",
    "description":"Test transaction",
    "date":"2024-03-29"
  }')
echo $CREATE
echo ""

echo "4. Testing Dashboard Stats..."
curl -s $BASE_URL/api/dashboard/stats | jq .
echo ""

echo "5. Testing Recent Transactions..."
curl -s $BASE_URL/api/dashboard/recent | jq .
echo ""

echo "6. Testing Category Breakdown..."
curl -s $BASE_URL/api/dashboard/categories | jq .
```

Run with: `bash test-api.sh`

## Notes

- All dates should be in `YYYY-MM-DD` format
- All amounts should be positive numbers
- Categories must be from the predefined list
- Authentication is not required for API calls (for development)
- Use `credentials: 'include'` in JavaScript for session persistence
