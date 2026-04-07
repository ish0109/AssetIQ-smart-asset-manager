<?php
/**
 * Transaction Detail API Endpoint
 * Converted from: app/api/transactions/[id]/route.ts
 */

session_start();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../lib/transactions.php';
require_once __DIR__ . '/../../lib/helpers.php';

Request::init();

$method = Request::getMethod();
$id = $_GET['id'] ?? null;

if (!$id) {
    ApiResponse::error('Transaction ID is required', 400);
}

if ($method === 'GET') {
    handleGetTransaction($id);
} elseif ($method === 'PUT') {
    handleUpdateTransaction($id);
} elseif ($method === 'DELETE') {
    handleDeleteTransaction($id);
} else {
    ApiResponse::error('Method not allowed', 405);
}

function handleGetTransaction(string $id): void {
    try {
        $collection = Database::getTransactionsCollection();

        $document = $collection->findOne(['_id' => $id]);

        if (!$document) {
            ApiResponse::error('Transaction not found', 404);
        }

        $transaction = Database::toTransaction($document);
        ApiResponse::success($transaction);
    } catch (Exception $e) {
        error_log('Error fetching transaction: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch transaction', 500);
    }
}

function handleUpdateTransaction(string $id): void {
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

        $result = $collection->updateOne(
            ['_id' => $id],
            [
                '$set' => [
                    'type' => $type,
                    'amount' => (float)$amount,
                    'category' => $category,
                    'description' => $description,
                    'date' => $date,
                    'updated_at' => time(),
                ],
            ]
        );

        if ($result['modifiedCount'] === 0) {
            ApiResponse::error('Transaction not found', 404);
        }

        // Fetch updated document
        $updated = $collection->findOne(['_id' => $id]);

        if (!$updated) {
            ApiResponse::error('Failed to fetch updated transaction', 500);
        }

        $transaction = Database::toTransaction($updated);
        ApiResponse::success($transaction);
    } catch (Exception $e) {
        error_log('Error updating transaction: ' . $e->getMessage());
        ApiResponse::error('Failed to update transaction', 500);
    }
}

function handleDeleteTransaction(string $id): void {
    try {
        $collection = Database::getTransactionsCollection();

        $result = $collection->deleteOne(['_id' => $id]);

        if ($result['deletedCount'] === 0) {
            ApiResponse::error('Transaction not found', 404);
        }

        ApiResponse::success(['success' => true]);
    } catch (Exception $e) {
        error_log('Error deleting transaction: ' . $e->getMessage());
        ApiResponse::error('Failed to delete transaction', 500);
    }
}
