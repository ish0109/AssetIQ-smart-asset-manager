'use client';

import { Asset } from '@/lib/transactions';
import { Card } from '@/components/ui/card';

interface RecentAssetsProps {
  transactions: Asset[];
}

export function RecentTransactions({ transactions }: RecentAssetsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Assets</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No assets yet</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{asset.name || asset.type}</p>
                <p className="text-sm text-gray-500">
                  {asset.type} - Purchased {new Date(asset.purchase_date).toLocaleDateString()}
                </p>
              </div>
              <span className="font-semibold text-blue-600">${Number(asset.value).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
