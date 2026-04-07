<?php
/**
 * Recent Transactions API Endpoint
 * Converted from: app/api/dashboard/recent/route.ts
 */

session_start();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/helpers.php';

Request::init();

if (Request::getMethod() !== 'GET') {
    ApiResponse::error('Method not allowed', 405);
}

try {
    $collection = Database::getTransactionsCollection();

    $options = ['sort' => ['date' => -1], 'limit' => 5];
    $documents = $collection->find([], $options)->toArray();

    $transactions = array_map([Database::class, 'toTransaction'], $documents);

    ApiResponse::success($transactions);
} catch (Exception $e) {
    error_log('Error fetching recent transactions: ' . $e->getMessage());
    ApiResponse::error('Failed to fetch recent transactions', 500);
}
