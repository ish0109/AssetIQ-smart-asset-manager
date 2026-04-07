<?php

class Insights {
    public static function generate(array $assets, array $liabilities): array {
        $insights = [];

        $totalAssets = array_reduce($assets, static function ($sum, $asset) {
            return $sum + (float)($asset['value'] ?? 0);
        }, 0.0);

        $totalLiabilities = array_reduce($liabilities, static function ($sum, $liability) {
            return $sum + (float)($liability['amount'] ?? 0);
        }, 0.0);

        $byCategory = [];
        foreach ($assets as $asset) {
            $type = (string)($asset['type'] ?? 'Other');
            $byCategory[$type] = ($byCategory[$type] ?? 0) + (float)($asset['value'] ?? 0);
        }

        if (!empty($byCategory)) {
            arsort($byCategory);
            $topCategory = array_key_first($byCategory);
            $topValue = $byCategory[$topCategory];
            $insights[] = "Your highest investment is in {$topCategory}.";

            if ($totalAssets > 0 && ($topValue / $totalAssets) >= 0.5) {
                $insights[] = "You have high exposure to {$topCategory}.";
            }

            $savingsValue = $byCategory['Savings'] ?? 0;
            if ($totalAssets > 0 && ($savingsValue / $totalAssets) < 0.15) {
                $insights[] = 'Your savings are low compared to total assets.';
            }
        }

        if ($totalLiabilities > 0) {
            $dueSoonCount = 0;
            $today = new DateTimeImmutable('today');

            foreach ($liabilities as $liability) {
                $dueDateValue = (string)($liability['due_date'] ?? '');
                if ($dueDateValue === '') {
                    continue;
                }

                try {
                    $dueDate = new DateTimeImmutable($dueDateValue);
                } catch (Exception $e) {
                    continue;
                }

                $daysUntilDue = (int)$today->diff($dueDate)->format('%r%a');
                if ($daysUntilDue <= 30) {
                    $dueSoonCount++;
                }
            }

            if ($totalAssets > 0 && ($totalLiabilities / $totalAssets) >= 0.4) {
                $insights[] = 'Your liabilities are increasing relative to your assets.';
            } elseif ($totalLiabilities >= 10000) {
                $insights[] = 'Your liabilities are increasing.';
            }

            if ($dueSoonCount > 0) {
                $insights[] = "{$dueSoonCount} liabilities are due within the next 30 days.";
            }
        }

        if (empty($insights)) {
            $insights[] = 'Your portfolio is balanced so far. Add more assets or liabilities to unlock deeper insights.';
        }

        return array_values(array_unique($insights));
    }
}
