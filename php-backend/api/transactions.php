<?php
/**
 * Transactions API Endpoint
 * Converted from: app/api/transactions/route.ts
 */

session_start();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../lib/transactions.php';
require_once __DIR__ . '/../../lib/helpers.php';

Request::init();

$method = Request::getMethod();

if ($method === 'GET') {
    handleGetTransactions();
} elseif ($method === 'POST') {
    handleCreateTransaction();
} else {
    ApiResponse::error('Method not allowed', 405);
}

function handleGetTransactions(): void {
    try {
        $type = Request::query('type');
        $category = Request::query('category');
        $search = Request::query('search');
        $limit = (int)(Request::query('limit') ?? 100);

        $collection = Database::getTransactionsCollection();

        // Build filter
        $filter = [];

        if ($type && $type !== 'all') {
            $filter['type'] = $type;
        }

        if ($category && $category !== 'all') {
            $filter['category'] = $category;
        }

        if ($search) {
            $filter['description'] = ['$regex' => $search, '$options' => 'i'];
        }

        // Get documents
        $options = ['sort' => ['date' => -1], 'limit' => $limit];
        $documents = $collection->find($filter, $options)->toArray();

        // Convert to transactions
        $transactions = array_map([Database::class, 'toTransaction'], $documents);

        ApiResponse::success($transactions);
    } catch (Exception $e) {
        error_log('Error fetching transactions: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch transactions', 500);
    }
}

function handleCreateTransaction(): void {
    try {
        $body = Request::allBody();
        $type = $body['type'] ?? null;
        $amount = $body['amount'] ?? null;
        $category = $body['category'] ?? null;
        $description = $body['description'] ?? null;
        $date = $body['date'] ?? null;

        if (!$type || !$amount || !$category || !$description || !$date) {
            ApiResponse::error('Missing required fields', 400);
        }

        // Validate
        $validation = TransactionUtils::validateTransaction([
            'type' => $type,
            'amount' => $amount,
            'category' => $category,
            'description' => $description,
            'date' => $date,
        ]);

        if (!$validation['valid']) {
            ApiResponse::error('Validation failed: ' . implode(', ', $validation['errors']), 400);
        }

        $collection = Database::getTransactionsCollection();

        $newTransaction = [
            'type' => $type,
            'amount' => (float)$amount,
            'category' => $category,
            'description' => $description,
            'date' => $date,
            'created_at' => time(),
        ];

        $result = $collection->insertOne($newTransaction);

        // Fetch inserted document
        $inserted = $collection->findOne(['_id' => $result->getInsertedId()]);

        if (!$inserted) {
            ApiResponse::error('Failed to retrieve inserted transaction', 500);
        }

        $transaction = Database::toTransaction($inserted);
        ApiResponse::success($transaction, 201);
    } catch (Exception $e) {
        error_log('Error creating transaction: ' . $e->getMessage());
        ApiResponse::error('Failed to create transaction', 500);
    }
}
