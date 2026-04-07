<?php

class TransactionUtils {
    public const ASSET_TYPES = [
        'Savings',
        'Property',
        'Stocks',
        'Crypto',
        'Gold',
        'Investments',
    ];

    public const LIABILITY_TYPES = [
        'Loan',
        'Credit Card',
        'EMI',
        'Other',
    ];

    public static function getCategories(): array {
        return self::ASSET_TYPES;
    }

    public static function validateTransaction(array $data): array {
        $errors = [];

        if (!array_key_exists('value', $data) || $data['value'] === '' || $data['value'] === null) {
            $errors[] = 'Value is required';
        } elseif (!is_numeric($data['value']) || (float)$data['value'] < 0) {
            $errors[] = 'Value must be a valid non-negative number';
        }

        if (empty($data['type'])) {
            $errors[] = 'Asset type is required';
        } elseif (!in_array($data['type'], self::ASSET_TYPES, true)) {
            $errors[] = 'Invalid asset type';
        }

        if (isset($data['name']) && !is_string($data['name'])) {
            $errors[] = 'Name must be text';
        }

        if (empty($data['purchase_date'])) {
            $errors[] = 'Purchase date is required';
        } elseif (!strtotime((string)$data['purchase_date'])) {
            $errors[] = 'Invalid purchase date format';
        }

        return ['valid' => empty($errors), 'errors' => $errors];
    }

    public static function validateLiability(array $data): array {
        $errors = [];

        if (empty(trim((string)($data['name'] ?? '')))) {
            $errors[] = 'Name is required';
        }

        if (!array_key_exists('amount', $data) || $data['amount'] === '' || $data['amount'] === null) {
            $errors[] = 'Amount is required';
        } elseif (!is_numeric($data['amount']) || (float)$data['amount'] < 0) {
            $errors[] = 'Amount must be a valid non-negative number';
        }

        if (empty($data['type'])) {
            $errors[] = 'Liability type is required';
        } elseif (!in_array($data['type'], self::LIABILITY_TYPES, true)) {
            $errors[] = 'Invalid liability type';
        }

        if (empty($data['due_date'])) {
            $errors[] = 'Due date is required';
        } elseif (!strtotime((string)$data['due_date'])) {
            $errors[] = 'Invalid due date format';
        }

        return ['valid' => empty($errors), 'errors' => $errors];
    }
}
