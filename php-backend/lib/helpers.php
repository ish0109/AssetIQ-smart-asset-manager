<?php
/**
 * API Response Handler
 */

class ApiResponse {
    public static function json(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function success(array $data, int $statusCode = 200): void {
        self::json($data, $statusCode);
    }

    public static function error(string $message, int $statusCode = 500): void {
        self::json(['error' => $message], $statusCode);
    }
}

/**
 * Request Handler
 */
class Request {
    private static array $queryParams = [];
    private static array $bodyData = [];
    private static array $headers = [];

    public static function init(): void {
        // Parse query parameters
        self::$queryParams = $_GET;
        self::$headers = function_exists('getallheaders') ? getallheaders() : [];

        // Parse body data
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'application/json') !== false) {
            $input = file_get_contents('php://input');
            self::$bodyData = json_decode($input, true) ?? [];
        } else {
            self::$bodyData = $_POST;
        }
    }

    public static function getMethod(): string {
        return $_SERVER['REQUEST_METHOD'];
    }

    public static function query(string $key, $default = null) {
        return self::$queryParams[$key] ?? $default;
    }

    public static function body(string $key, $default = null) {
        return self::$bodyData[$key] ?? $default;
    }

    public static function allBody(): array {
        return self::$bodyData;
    }

    public static function allQuery(): array {
        return self::$queryParams;
    }

    public static function header(string $key, $default = null) {
        foreach (self::$headers as $headerKey => $value) {
            if (strcasecmp($headerKey, $key) === 0) {
                return $value;
            }
        }

        return $default;
    }
}
