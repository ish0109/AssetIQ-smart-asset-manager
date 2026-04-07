'use client';

import { Liability, LIABILITY_TYPES } from '@/lib/transactions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

interface LiabilityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Liability, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

export function LiabilityForm({ isOpen, onClose, onSubmit, isLoading }: LiabilityFormProps) {
  const [formData, setFormData] = useState<Omit<Liability, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    type: LIABILITY_TYPES[0],
    amount: 0,
    due_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      name: '',
      type: LIABILITY_TYPES[0],
      amount: 0,
      due_date: new Date().toISOString().split('T')[0],
    });
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, amount: Number(formData.amount) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Liability</DialogTitle>
          <DialogDescription>Track a liability such as a loan, EMI, or credit card balance.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="liability-name">Liability Name</Label>
            <Input
              id="liability-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Home Loan, Card Balance..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liability-type">Liability Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as Liability['type'] })}
              >
                <SelectTrigger id="liability-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIABILITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="liability-amount">Amount</Label>
              <Input
                id="liability-amount"
                type="number"
                min="0"
                step="0.01"
                value={Number.isFinite(formData.amount) ? formData.amount : ''}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value === '' ? 0 : Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="liability-due-date">Due Date</Label>
            <Input
              id="liability-due-date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Liability'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
