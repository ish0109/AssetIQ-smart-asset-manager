'use client';

import { Liability } from '@/lib/transactions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface LiabilityTableProps {
  liabilities: Liability[];
  onDelete: (id: string) => void;
}

export function LiabilityTable({ liabilities, onDelete }: LiabilityTableProps) {
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
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {liabilities.map((liability) => (
            <TableRow key={liability.id}>
              <TableCell className="font-medium">{liability.name}</TableCell>
              <TableCell>{liability.type}</TableCell>
              <TableCell>{new Date(liability.due_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right font-medium text-red-600">
                ${Number(liability.amount).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleting === liability.id}
                  onClick={() => handleDelete(liability.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
