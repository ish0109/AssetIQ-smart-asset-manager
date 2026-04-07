<?php
/**
 * Dashboard Stats API Endpoint
 * Converted from: app/api/dashboard/stats/route.ts
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

    // Calculate income total
    $incomeResults = $collection->aggregate([
        ['$match' => ['type' => 'income']],
        ['$group' => ['_id' => null, 'total' => ['$sum' => '$amount']]],
    ])->toArray();

    $expenseResults = $collection->aggregate([
        ['$match' => ['type' => 'expense']],
        ['$group' => ['_id' => null, 'total' => ['$sum' => '$amount']]],
    ])->toArray();

    $income = isset($incomeResults[0]['total']) ? $incomeResults[0]['total'] : 0;
    $expense = isset($expenseResults[0]['total']) ? $expenseResults[0]['total'] : 0;
    $balance = $income - $expense;

    ApiResponse::success([
        'income' => $income,
        'expense' => $expense,
        'balance' => $balance,
    ]);
} catch (Exception $e) {
    error_log('Error fetching dashboard stats: ' . $e->getMessage());
    ApiResponse::error('Failed to fetch stats', 500);
}
