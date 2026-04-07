<?php
/**
 * Category Breakdown API Endpoint
 * Converted from: app/api/dashboard/categories/route.ts
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

    $result = $collection->aggregate([
        ['$match' => ['type' => 'expense']],
        ['$group' => ['_id' => '$category', 'total' => ['$sum' => '$amount']]],
        ['$sort' => ['total' => -1]],
    ])->toArray();

    $data = array_map(function ($row) {
        return [
            'category' => $row['_id'],
            'total' => $row['total'],
        ];
    }, is_array($result) ? $result : []);

    ApiResponse::success($data);
} catch (Exception $e) {
    error_log('Error fetching category breakdown: ' . $e->getMessage());
    ApiResponse::error('Failed to fetch category breakdown', 500);
}
