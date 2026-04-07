<?php
/**
 * PHP Backend Configuration
 * Copy this file to .env and update with your settings
 */

// Database Configuration
define('MONGODB_URI', getenv('MONGODB_URI') ?: null);
define('MONGODB_DB', getenv('MONGODB_DB') ?: 'transaction_dashboard');

// Server Configuration
define('API_BASE_URL', getenv('API_BASE_URL') ?: 'http://localhost:8000/php-backend/public');

// Authentication
define('SESSION_TIMEOUT', 3600); // 1 hour in seconds

// CORS Configuration
define('CORS_ALLOWED_ORIGINS', [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000',
]);

// Error Reporting
define('DEBUG_MODE', getenv('DEBUG_MODE') === 'true');

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
    ini_set('display_errors', 0);
}

// Session Configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
