<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use MongoDB\BSON\ObjectId;
use MongoDB\Client;
use MongoDB\Collection;

$dotenv = Dotenv::createUnsafeImmutable(dirname(__DIR__));
$dotenv->load();

class Database {
    private static ?Client $cachedClient = null;
    private static ?\MongoDB\Database $cachedDatabase = null;
    private static ?Collection $cachedAssetsCollection = null;
    private static ?Collection $cachedLiabilitiesCollection = null;
    private static ?Collection $cachedUsersCollection = null;

    private static function connectDatabase(): \MongoDB\Database {
        $mongoUri = getenv('MONGODB_URI');
        $mongoDb = getenv('MONGODB_DB') ?: 'transaction_dashboard';

        if (!$mongoUri) {
            throw new Exception('MONGODB_URI environment variable is not set.');
        }

        if (self::$cachedDatabase !== null) {
            return self::$cachedDatabase;
        }

        try {
            self::$cachedClient = new Client($mongoUri, [
                'serverSelectionTimeoutMS' => 5000,
                'connect' => true,
            ]);
            self::$cachedClient->listDatabases();
            self::$cachedDatabase = self::$cachedClient->selectDatabase($mongoDb);
            return self::$cachedDatabase;
        } catch (Exception $e) {
            error_log('Failed to connect to MongoDB: ' . $e->getMessage());
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    public static function getTransactionsCollection(): Collection {
        return self::getAssetsCollection();
    }

    public static function getAssetsCollection(): Collection {
        if (self::$cachedAssetsCollection === null) {
            self::$cachedAssetsCollection = self::connectDatabase()->selectCollection('assets');
            self::$cachedAssetsCollection->createIndex(['user_id' => 1], ['name' => 'assets_user_id']);
        }

        return self::$cachedAssetsCollection;
    }

    public static function getLiabilitiesCollection(): Collection {
        if (self::$cachedLiabilitiesCollection === null) {
            self::$cachedLiabilitiesCollection = self::connectDatabase()->selectCollection('liabilities');
            self::$cachedLiabilitiesCollection->createIndex(['user_id' => 1], ['name' => 'liabilities_user_id']);
        }

        return self::$cachedLiabilitiesCollection;
    }

    public static function getUsersCollection(): Collection {
        if (self::$cachedUsersCollection === null) {
            self::$cachedUsersCollection = self::connectDatabase()->selectCollection('users');
            self::$cachedUsersCollection->createIndex(
                ['email' => 1],
                ['unique' => true, 'name' => 'users_email_unique']
            );
        }

        return self::$cachedUsersCollection;
    }

    public static function toTransaction($doc): array {
        return self::toAsset($doc);
    }

    public static function toAsset($doc): array {
        $doc = self::normalizeDocument($doc);
        return [
            'id' => (string)($doc['_id'] ?? ''),
            'user_id' => isset($doc['user_id']) ? (string)$doc['user_id'] : '',
            'name' => $doc['name'] ?? '',
            'type' => $doc['type'] ?? '',
            'value' => isset($doc['value']) ? (float)$doc['value'] : 0,
            'purchase_date' => $doc['purchase_date'] ?? '',
            'created_at' => self::serializeDate($doc['created_at'] ?? null),
            'updated_at' => self::serializeDate($doc['updated_at'] ?? ($doc['created_at'] ?? null)),
        ];
    }

    public static function toLiability($doc): array {
        $doc = self::normalizeDocument($doc);
        return [
            'id' => (string)($doc['_id'] ?? ''),
            'user_id' => isset($doc['user_id']) ? (string)$doc['user_id'] : '',
            'name' => $doc['name'] ?? '',
            'type' => $doc['type'] ?? '',
            'amount' => isset($doc['amount']) ? (float)$doc['amount'] : 0,
            'due_date' => $doc['due_date'] ?? '',
            'created_at' => self::serializeDate($doc['created_at'] ?? null),
            'updated_at' => self::serializeDate($doc['updated_at'] ?? ($doc['created_at'] ?? null)),
        ];
    }

    public static function toUser($doc): array {
        $doc = self::normalizeDocument($doc);
        $email = strtolower($doc['email'] ?? '');
        $fallbackName = $email !== ''
            ? ucwords(str_replace(['.', '_', '-'], ' ', explode('@', $email)[0]))
            : '';

        return [
            'id' => (string)($doc['_id'] ?? ''),
            'name' => $doc['name'] ?? $fallbackName,
            'email' => $email,
        ];
    }

    private static function normalizeDocument($doc): array {
        if (is_array($doc)) {
            return $doc;
        }

        if (is_object($doc)) {
            return (array)$doc;
        }

        return [];
    }

    private static function serializeDate($value): string {
        if ($value instanceof \MongoDB\BSON\UTCDateTime) {
            return date('c', $value->toDateTime()->getTimestamp());
        }

        if (is_numeric($value)) {
            return date('c', (int)$value);
        }

        if (is_string($value) && $value !== '') {
            return $value;
        }

        return date('c');
    }

    public static function normalizeEmail(string $email): string {
        return strtolower(trim($email));
    }

    public static function requireObjectId(string $value, string $fieldName): ObjectId {
        $value = trim($value);

        if ($value === '') {
            throw new InvalidArgumentException("$fieldName is required");
        }

        if (preg_match('/^[a-f0-9]{24}$/i', $value) !== 1) {
            throw new InvalidArgumentException("$fieldName is invalid");
        }

        return new ObjectId($value);
    }

    public static function idsMatch($left, $right): bool {
        return (string)$left === (string)$right;
    }

    public static function findUserByEmail(string $email): ?array {
        $user = self::getUsersCollection()->findOne([
            'email' => self::normalizeEmail($email),
        ]);

        if (!$user) {
            return null;
        }

        return is_array($user) ? $user : (array)$user;
    }
}
