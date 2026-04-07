<?php
/**
 * PHP Backend Test Suite
 * Run: php test.php
 */

define('TESTING_MODE', true);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

class TestRunner {
    private int $passed = 0;
    private int $failed = 0;

    public function run(): void {
        echo "\n========================================\n";
        echo "PHP Backend Test Suite\n";
        echo "========================================\n\n";

        $this->testDatabaseConnection();
        $this->testTransactionUtils();
        $this->testAuthentication();
        $this->testApiResponse();

        $this->printResults();
    }

    private function testDatabaseConnection(): void {
        echo "Testing Database Connection...\n";

        try {
            require_once __DIR__ . '/config/database.php';

            $this->assert(class_exists('Database'), 'Database class exists');

            $collection = Database::getTransactionsCollection();
            $this->assert($collection !== null, 'MongoDB collection connected');

            echo "OK Database connection tests passed\n\n";
        } catch (Exception $e) {
            $this->fail("Database connection error: " . $e->getMessage());
        }
    }

    private function testTransactionUtils(): void {
        echo "Testing Transaction Utils...\n";

        try {
            require_once __DIR__ . '/lib/transactions.php';

            $categories = TransactionUtils::getCategories();
            $this->assert(count($categories) > 0, 'Categories exist');

            $types = TransactionUtils::getTransactionTypes();
            $this->assert(count($types) === 2, 'Two transaction types exist');

            $valid = TransactionUtils::validateTransaction([
                'type' => 'expense',
                'amount' => 50,
                'category' => 'Shopping',
                'description' => 'Test purchase',
                'date' => '2024-03-29',
            ]);
            $this->assert($valid['valid'] === true, 'Valid transaction passes');

            echo "OK Transaction utils tests passed\n\n";
        } catch (Exception $e) {
            $this->fail("Transaction utils error: " . $e->getMessage());
        }
    }

    private function testAuthentication(): void {
        echo "Testing Authentication...\n";

        try {
            require_once __DIR__ . '/config/database.php';
            require_once __DIR__ . '/config/auth.php';
            $email = 'test+' . time() . '@example.com';
            $password = 'secure123';

            $signup = Auth::signup($email, $password);
            $this->assert($signup['success'] === true, 'Valid signup succeeds');
            $this->assert(($signup['user']['email'] ?? null) === $email, 'Signup returns MongoDB user');

            Auth::logout();

            $result = Auth::login($email, $password);
            $this->assert($result['success'] === true, 'Valid login succeeds');
            $this->assert(($result['user']['email'] ?? null) === $email, 'Login returns MongoDB user');

            $isAuth = Auth::isAuthenticated();
            $this->assert($isAuth === true, 'User authenticated');

            $invalid = Auth::login($email, 'wrong-password');
            $this->assert($invalid['success'] === false, 'Invalid password is rejected');

            echo "OK Authentication tests passed\n\n";
        } catch (Exception $e) {
            $this->fail("Authentication error: " . $e->getMessage());
        }
    }

    private function testApiResponse(): void {
        echo "Testing API Response Handler...\n";

        try {
            require_once __DIR__ . '/lib/helpers.php';

            $this->assert(class_exists('ApiResponse'), 'ApiResponse class exists');
            $this->assert(class_exists('Request'), 'Request class exists');

            echo "OK API response handler tests passed\n\n";
        } catch (Exception $e) {
            $this->fail("API response error: " . $e->getMessage());
        }
    }

    private function assert(bool $condition, string $message): void {
        if ($condition) {
            echo "  OK $message\n";
            $this->passed++;
        } else {
            echo "  FAIL $message\n";
            $this->failed++;
        }
    }

    private function fail(string $message): void {
        echo "  FAIL $message\n";
        $this->failed++;
    }

    private function printResults(): void {
        echo "\n========================================\n";
        echo "Test Results\n";
        echo "========================================\n";
        echo "Passed: {$this->passed}\n";
        echo "Failed: {$this->failed}\n";
        echo "========================================\n\n";

        if ($this->failed === 0) {
            echo "All tests passed. Backend is ready.\n\n";
        } else {
            echo "Some tests failed. Fix the errors above.\n\n";
        }
    }
}

$runner = new TestRunner();
$runner->run();
