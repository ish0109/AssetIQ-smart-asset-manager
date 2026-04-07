<?php
/**
 * Authentication Handler
 * Converted from: lib/auth-context.tsx
 */

require_once __DIR__ . '/database.php';

class Auth {
    public static function validateCredentials(string $email, string $password): array {
        $email = Database::normalizeEmail($email);
        $password = trim($password);
        $errors = [];

        if ($email === '') {
            $errors[] = 'Email is required';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Email format is invalid';
        }

        if ($password === '') {
            $errors[] = 'Password is required';
        } elseif (strlen($password) < 6) {
            $errors[] = 'Password must be at least 6 characters';
        }

        return [
            'valid' => empty($errors),
            'email' => $email,
            'password' => $password,
            'errors' => $errors,
        ];
    }

    private static function startUserSession(array $user): array {
        $publicUser = Database::toUser($user);
        $_SESSION['auth_user'] = $publicUser;
        $_SESSION['last_activity'] = time();

        return $publicUser;
    }

    public static function signup(string $email, string $password): array {
        $validation = self::validateCredentials($email, $password);

        if (!$validation['valid']) {
            return ['success' => false, 'error' => implode(', ', $validation['errors'])];
        }

        $normalizedEmail = $validation['email'];

        if (Database::findUserByEmail($normalizedEmail)) {
            return ['success' => false, 'error' => 'An account with this email already exists'];
        }

        $now = new \MongoDB\BSON\UTCDateTime((int)(microtime(true) * 1000));

        $insertResult = Database::getUsersCollection()->insertOne([
            'email' => $normalizedEmail,
            'password' => password_hash($validation['password'], PASSWORD_DEFAULT),
            'created_at' => $now,
        ]);

        $user = Database::getUsersCollection()->findOne([
            '_id' => $insertResult->getInsertedId(),
        ]);

        if (!$user) {
            return ['success' => false, 'error' => 'Failed to create account'];
        }

        return [
            'success' => true,
            'user' => self::startUserSession(is_array($user) ? $user : (array)$user),
        ];
    }

    public static function login(string $email, string $password): array {
        $validation = self::validateCredentials($email, $password);

        if (!$validation['valid']) {
            return ['success' => false, 'error' => implode(', ', $validation['errors'])];
        }

        $user = Database::findUserByEmail($validation['email']);

        if (!$user) {
            return ['success' => false, 'error' => 'Invalid email or password'];
        }

        $passwordHash = $user['password'] ?? '';

        if (!is_string($passwordHash) || !password_verify($validation['password'], $passwordHash)) {
            return ['success' => false, 'error' => 'Invalid email or password'];
        }

        return ['success' => true, 'user' => self::startUserSession($user)];
    }

    public static function logout(): void {
        unset($_SESSION['auth_user']);
        unset($_SESSION['last_activity']);
        session_destroy();
    }

    public static function getUser(): ?array {
        if (!self::verifySession()) {
            return null;
        }

        return $_SESSION['auth_user'] ?? null;
    }

    public static function getAuthenticatedUserId(): string {
        $user = self::getUser();

        if (!$user || empty($user['id'])) {
            ApiResponse::error('Not authenticated', 401);
        }

        return (string)$user['id'];
    }

    public static function isAuthenticated(): bool {
        return self::verifySession();
    }

    public static function verifySession(): bool {
        if (!isset($_SESSION['auth_user'])) {
            return false;
        }

        $timeout = (int)(getenv('SESSION_TIMEOUT') ?: 3600);
        $lastActivity = $_SESSION['last_activity'] ?? null;

        if ($lastActivity && (time() - (int)$lastActivity) > $timeout) {
            self::logout();
            return false;
        }

        $_SESSION['last_activity'] = time();
        return true;
    }

    public static function requireAuthentication(): void {
        if (!self::isAuthenticated()) {
            ApiResponse::error('Not authenticated', 401);
        }
    }
}
