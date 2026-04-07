'use client';

import { Asset } from '@/lib/transactions';
import { Card } from '@/components/ui/card';

interface AssetSummaryProps {
  transactions: Asset[];
  liabilitiesTotal?: number;
}

export function TransactionSummary({ transactions, liabilitiesTotal = 0 }: AssetSummaryProps) {
  const totalValue = transactions.reduce((sum, asset) => sum + Number(asset.value || 0), 0);
  const totalAssets = transactions.length;
  const netWorth = totalValue - liabilitiesTotal;
  const averageValue = totalAssets > 0 ? totalValue / totalAssets : 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="p-4">
        <p className="text-sm font-medium text-gray-600">Net Worth</p>
        <p className="mt-2 text-2xl font-bold text-blue-600">${netWorth.toFixed(2)}</p>
      </Card>
      <Card className="p-4">
        <p className="text-sm font-medium text-gray-600">Total Assets</p>
        <p className="mt-2 text-2xl font-bold text-emerald-600">{totalAssets}</p>
      </Card>
      <Card className="p-4">
        <p className="text-sm font-medium text-gray-600">Average Asset Value</p>
        <p className="mt-2 text-2xl font-bold text-amber-600">${averageValue.toFixed(2)}</p>
      </Card>
    </div>
  );
}
