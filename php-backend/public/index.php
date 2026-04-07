<?php

session_start();
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../lib/transactions.php';
require_once __DIR__ . '/../lib/insights.php';
require_once __DIR__ . '/../lib/helpers.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, user-id');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

Request::init();

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = '/php-backend/public';
$path = str_replace($basePath, '', $requestUri);
$path = strtok($path, '?');

$method = Request::getMethod();
$parts = array_filter(explode('/', trim($path, '/')));

if (empty($parts)) {
    ApiResponse::json(['message' => 'API Server Running']);
}

$route = implode('/', $parts);

switch ($route) {
    case 'api/assets':
    case 'api/transactions':
        if ($method === 'GET') {
            handleAssetsGet();
        } elseif ($method === 'POST') {
            handleAssetsPost();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case preg_match('/^api\/(assets|transactions)\/[^\/]+$/', $route) ? true : false:
        $assetId = end($parts);
        if ($method === 'GET') {
            handleAssetGet($assetId);
        } elseif ($method === 'PUT') {
            handleAssetPut($assetId);
        } elseif ($method === 'DELETE') {
            handleAssetDelete($assetId);
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case 'api/liabilities':
        if ($method === 'GET') {
            handleLiabilitiesGet();
        } elseif ($method === 'POST') {
            handleLiabilitiesPost();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case preg_match('/^api\/liabilities\/[^\/]+$/', $route) ? true : false:
        $liabilityId = end($parts);
        if ($method === 'DELETE') {
            handleLiabilityDelete($liabilityId);
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case 'api/insights':
        if ($method === 'GET') {
            handleInsightsGet();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case 'api/dashboard/stats':
        if ($method === 'GET') {
            handleDashboardStats();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case 'api/dashboard/recent':
        if ($method === 'GET') {
            handleDashboardRecent();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case 'api/dashboard/distribution':
    case 'api/dashboard/categories':
        if ($method === 'GET') {
            handleDashboardDistribution();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case 'api/auth/login':
        if ($method === 'POST') {
            handleAuthLogin();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case 'api/auth/signup':
        if ($method === 'POST') {
            handleAuthSignup();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case 'api/auth/logout':
        if ($method === 'POST') {
            handleAuthLogout();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    case 'api/auth/user':
        if ($method === 'GET') {
            handleAuthUser();
        } else {
            ApiResponse::error('Method not allowed', 405);
        }
        break;

    default:
        ApiResponse::error('Endpoint not found', 404);
}

function handleAssetsGet(): void {
    try {
        $requestUserId = requireRequestUserId();
        error_log('[assets.get] user_id=' . $requestUserId);

        $type = Request::query('type');
        $search = Request::query('search');
        $limit = max(1, (int)(Request::query('limit') ?? 100));
        $filter = ['user_id' => Database::requireObjectId($requestUserId, 'user_id')];

        if ($type && $type !== 'all') {
            $filter['type'] = $type;
        }
        if ($search) {
            $filter['name'] = ['$regex' => $search, '$options' => 'i'];
        }

        $documents = Database::getAssetsCollection()
            ->find($filter, ['sort' => ['purchase_date' => -1, 'created_at' => -1], 'limit' => $limit])
            ->toArray();

        ApiResponse::success(array_map([Database::class, 'toAsset'], $documents));
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error fetching assets: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch assets', 500);
    }
}

function handleAssetsPost(): void {
    try {
        $requestUserId = requireRequestUserId(Request::allBody()['user_id'] ?? null);
        $body = Request::allBody();
        $payload = [
            'name' => trim((string)($body['name'] ?? '')),
            'type' => $body['type'] ?? null,
            'value' => $body['value'] ?? null,
            'purchase_date' => $body['purchase_date'] ?? null,
        ];

        $validation = TransactionUtils::validateTransaction($payload);
        if (!$validation['valid']) {
            ApiResponse::error('Validation failed: ' . implode(', ', $validation['errors']), 400);
        }

        $newAsset = [
            'user_id' => Database::requireObjectId($requestUserId, 'user_id'),
            'name' => $payload['name'],
            'type' => $payload['type'],
            'value' => (float)$payload['value'],
            'purchase_date' => $payload['purchase_date'],
            'created_at' => new \MongoDB\BSON\UTCDateTime((int)(microtime(true) * 1000)),
        ];

        $collection = Database::getAssetsCollection();
        $result = $collection->insertOne($newAsset);
        $inserted = $collection->findOne(['_id' => $result->getInsertedId()]);

        ApiResponse::success(Database::toAsset($inserted), 201);
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error creating asset: ' . $e->getMessage());
        ApiResponse::error('Failed to create asset', 500);
    }
}

function handleAssetGet(string $id): void {
    try {
        $requestUserId = requireRequestUserId(Request::query('user_id'));
        $document = Database::getAssetsCollection()->findOne([
            '_id' => Database::requireObjectId($id, 'id'),
            'user_id' => Database::requireObjectId($requestUserId, 'user_id'),
        ]);

        if (!$document) {
            ApiResponse::error('Asset not found', 404);
        }

        ApiResponse::success(Database::toAsset($document));
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error fetching asset: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch asset', 500);
    }
}

function handleAssetPut(string $id): void {
    try {
        $body = Request::allBody();
        $requestUserId = requireRequestUserId($body['user_id'] ?? null);
        $payload = [
            'name' => trim((string)($body['name'] ?? '')),
            'type' => $body['type'] ?? null,
            'value' => $body['value'] ?? null,
            'purchase_date' => $body['purchase_date'] ?? null,
        ];

        $validation = TransactionUtils::validateTransaction($payload);
        if (!$validation['valid']) {
            ApiResponse::error('Validation failed: ' . implode(', ', $validation['errors']), 400);
        }

        $collection = Database::getAssetsCollection();
        $filter = [
            '_id' => Database::requireObjectId($id, 'id'),
            'user_id' => Database::requireObjectId($requestUserId, 'user_id'),
        ];

        $result = $collection->updateOne($filter, [
            '$set' => [
                'name' => $payload['name'],
                'type' => $payload['type'],
                'value' => (float)$payload['value'],
                'purchase_date' => $payload['purchase_date'],
                'updated_at' => new \MongoDB\BSON\UTCDateTime((int)(microtime(true) * 1000)),
            ],
        ]);

        if ($result->getMatchedCount() === 0) {
            ApiResponse::error('Asset not found', 404);
        }

        $updated = $collection->findOne($filter);
        ApiResponse::success(Database::toAsset($updated));
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error updating asset: ' . $e->getMessage());
        ApiResponse::error('Failed to update asset', 500);
    }
}

function handleAssetDelete(string $id): void {
    try {
        $body = Request::allBody();
        $requestUserId = requireRequestUserId($body['user_id'] ?? null);
        $deleteFilter = [
            '_id' => Database::requireObjectId($id, 'id'),
            'user_id' => Database::requireObjectId($requestUserId, 'user_id'),
        ];

        $result = Database::getAssetsCollection()->deleteOne($deleteFilter);
        if ($result->getDeletedCount() === 0) {
            ApiResponse::error('Asset not found', 404);
        }

        ApiResponse::success(['success' => true]);
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error deleting asset: ' . $e->getMessage());
        ApiResponse::error('Failed to delete asset', 500);
    }
}

function handleLiabilitiesGet(): void {
    try {
        $requestUserId = requireRequestUserId();
        $type = Request::query('type');
        $search = Request::query('search');
        $limit = max(1, (int)(Request::query('limit') ?? 100));
        $filter = ['user_id' => Database::requireObjectId($requestUserId, 'user_id')];

        if ($type && $type !== 'all') {
            $filter['type'] = $type;
        }
        if ($search) {
            $filter['name'] = ['$regex' => $search, '$options' => 'i'];
        }

        $documents = Database::getLiabilitiesCollection()
            ->find($filter, ['sort' => ['due_date' => 1, 'created_at' => -1], 'limit' => $limit])
            ->toArray();

        ApiResponse::success(array_map([Database::class, 'toLiability'], $documents));
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error fetching liabilities: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch liabilities', 500);
    }
}

function handleLiabilitiesPost(): void {
    try {
        $body = Request::allBody();
        $requestUserId = requireRequestUserId($body['user_id'] ?? null);
        $payload = [
            'name' => trim((string)($body['name'] ?? '')),
            'type' => $body['type'] ?? null,
            'amount' => $body['amount'] ?? null,
            'due_date' => $body['due_date'] ?? null,
        ];

        $validation = TransactionUtils::validateLiability($payload);
        if (!$validation['valid']) {
            ApiResponse::error('Validation failed: ' . implode(', ', $validation['errors']), 400);
        }

        $newLiability = [
            'user_id' => Database::requireObjectId($requestUserId, 'user_id'),
            'name' => $payload['name'],
            'type' => $payload['type'],
            'amount' => (float)$payload['amount'],
            'due_date' => $payload['due_date'],
            'created_at' => new \MongoDB\BSON\UTCDateTime((int)(microtime(true) * 1000)),
        ];

        $collection = Database::getLiabilitiesCollection();
        $result = $collection->insertOne($newLiability);
        $inserted = $collection->findOne(['_id' => $result->getInsertedId()]);

        ApiResponse::success(Database::toLiability($inserted), 201);
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error creating liability: ' . $e->getMessage());
        ApiResponse::error('Failed to create liability', 500);
    }
}

function handleLiabilityDelete(string $id): void {
    try {
        $body = Request::allBody();
        $requestUserId = requireRequestUserId($body['user_id'] ?? null);
        $deleteFilter = [
            '_id' => Database::requireObjectId($id, 'id'),
            'user_id' => Database::requireObjectId($requestUserId, 'user_id'),
        ];

        $result = Database::getLiabilitiesCollection()->deleteOne($deleteFilter);
        if ($result->getDeletedCount() === 0) {
            ApiResponse::error('Liability not found', 404);
        }

        ApiResponse::success(['success' => true]);
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error deleting liability: ' . $e->getMessage());
        ApiResponse::error('Failed to delete liability', 500);
    }
}

function handleDashboardStats(): void {
    try {
        $requestUserId = requireRequestUserId(Request::query('user_id'));
        $userObjectId = Database::requireObjectId($requestUserId, 'user_id');

        $assetResults = Database::getAssetsCollection()->aggregate([
            ['$match' => ['user_id' => $userObjectId]],
            ['$group' => ['_id' => null, 'total' => ['$sum' => '$value'], 'count' => ['$sum' => 1]]],
        ])->toArray();

        $liabilityResults = Database::getLiabilitiesCollection()->aggregate([
            ['$match' => ['user_id' => $userObjectId]],
            ['$group' => ['_id' => null, 'total' => ['$sum' => '$amount'], 'count' => ['$sum' => 1]]],
        ])->toArray();

        $totalAssets = isset($assetResults[0]['total']) ? (float)$assetResults[0]['total'] : 0;
        $assetCount = isset($assetResults[0]['count']) ? (int)$assetResults[0]['count'] : 0;
        $totalLiabilities = isset($liabilityResults[0]['total']) ? (float)$liabilityResults[0]['total'] : 0;
        $liabilityCount = isset($liabilityResults[0]['count']) ? (int)$liabilityResults[0]['count'] : 0;

        ApiResponse::success([
            'totalAssets' => $totalAssets,
            'totalLiabilities' => $totalLiabilities,
            'netWorth' => $totalAssets - $totalLiabilities,
            'assetCount' => $assetCount,
            'liabilityCount' => $liabilityCount,
        ]);
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error fetching dashboard stats: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch stats', 500);
    }
}

function handleDashboardRecent(): void {
    try {
        $requestUserId = requireRequestUserId(Request::query('user_id'));
        $documents = Database::getAssetsCollection()->find(
            ['user_id' => Database::requireObjectId($requestUserId, 'user_id')],
            ['sort' => ['purchase_date' => -1, 'created_at' => -1], 'limit' => 5]
        )->toArray();

        ApiResponse::success(array_map([Database::class, 'toAsset'], $documents));
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error fetching recent assets: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch recent assets', 500);
    }
}

function handleDashboardDistribution(): void {
    try {
        $requestUserId = requireRequestUserId(Request::query('user_id'));
        $result = Database::getAssetsCollection()->aggregate([
            ['$match' => ['user_id' => Database::requireObjectId($requestUserId, 'user_id')]],
            ['$group' => ['_id' => '$type', 'total' => ['$sum' => '$value']]],
            ['$sort' => ['total' => -1]],
        ])->toArray();

        $data = array_map(static function ($row) {
            return ['category' => (string)$row['_id'], 'total' => (float)$row['total']];
        }, is_array($result) ? $result : []);

        ApiResponse::success($data);
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error fetching asset distribution: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch asset distribution', 500);
    }
}

function handleInsightsGet(): void {
    try {
        $requestUserId = requireRequestUserId(Request::query('user_id'));
        $userObjectId = Database::requireObjectId($requestUserId, 'user_id');

        $assetDocuments = Database::getAssetsCollection()->find(['user_id' => $userObjectId])->toArray();
        $liabilityDocuments = Database::getLiabilitiesCollection()->find(['user_id' => $userObjectId])->toArray();

        $assets = array_map([Database::class, 'toAsset'], $assetDocuments);
        $liabilities = array_map([Database::class, 'toLiability'], $liabilityDocuments);

        ApiResponse::success(Insights::generate($assets, $liabilities));
    } catch (InvalidArgumentException $e) {
        ApiResponse::error($e->getMessage(), 400);
    } catch (Exception $e) {
        error_log('Error fetching insights: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch insights', 500);
    }
}

function handleAuthLogin(): void {
    try {
        $body = Request::allBody();
        $email = $body['email'] ?? null;
        $password = $body['password'] ?? null;

        if (!$email || !$password) {
            ApiResponse::error('Email and password are required', 400);
        }

        $result = Auth::login($email, $password);
        if (!$result['success']) {
            ApiResponse::error($result['error'] ?? 'Login failed', 401);
        }

        ApiResponse::success(['success' => true, 'user' => $result['user']]);
    } catch (Exception $e) {
        error_log('Error during login: ' . $e->getMessage());
        ApiResponse::error('Login failed', 500);
    }
}

function handleAuthSignup(): void {
    try {
        $body = Request::allBody();
        $email = $body['email'] ?? null;
        $password = $body['password'] ?? null;

        if (!$email || !$password) {
            ApiResponse::error('Email and password are required', 400);
        }

        $result = Auth::signup($email, $password);
        if (!$result['success']) {
            $message = $result['error'] ?? 'Signup failed';
            $status = $message === 'An account with this email already exists' ? 409 : 400;
            ApiResponse::error($message, $status);
        }

        ApiResponse::success(['success' => true, 'user' => $result['user']], 201);
    } catch (Exception $e) {
        error_log('Error during signup: ' . $e->getMessage());
        ApiResponse::error('Signup failed', 500);
    }
}

function handleAuthLogout(): void {
    try {
        Auth::logout();
        ApiResponse::success(['success' => true]);
    } catch (Exception $e) {
        error_log('Error during logout: ' . $e->getMessage());
        ApiResponse::error('Logout failed', 500);
    }
}

function handleAuthUser(): void {
    try {
        if (!Auth::isAuthenticated()) {
            ApiResponse::error('Not authenticated', 401);
        }

        ApiResponse::success(['user' => Auth::getUser()]);
    } catch (Exception $e) {
        error_log('Error fetching user: ' . $e->getMessage());
        ApiResponse::error('Failed to fetch user', 500);
    }
}

function requireRequestUserId(?string $bodyUserId = null): string {
    Auth::requireAuthentication();
    $sessionUserId = Auth::getAuthenticatedUserId();
    $headerUserId = Request::header('user-id') ?? Request::header('X-User-Id');
    $requestUserId = trim((string)($bodyUserId ?? $headerUserId ?? Request::query('user_id') ?? ''));

    if ($requestUserId === '') {
        throw new InvalidArgumentException('user_id is required');
    }

    if (!Database::idsMatch($requestUserId, $sessionUserId)) {
        ApiResponse::error('Invalid user context', 403);
    }

    return $requestUserId;
}
