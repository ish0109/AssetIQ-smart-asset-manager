'use client';

import { Asset } from '@/lib/transactions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AssetTableProps {
  transactions: Asset[];
  onEdit: (transaction: Asset) => void;
  onDelete: (id: string) => void;
  onCopy?: (transaction: Asset) => void;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onCopy,
}: AssetTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.name || 'Unnamed Asset'}</TableCell>
              <TableCell>{asset.type}</TableCell>
              <TableCell>{new Date(asset.purchase_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right font-medium text-blue-600">
                ${Number(asset.value).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onCopy && (
                    <Button variant="ghost" size="sm" onClick={() => onCopy(asset)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onEdit(asset)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deleting === asset.id}
                    onClick={() => handleDelete(asset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
