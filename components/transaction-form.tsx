'use client';

import { Asset, ASSET_TYPES } from '@/lib/transactions';
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

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Asset;
  isLoading?: boolean;
  isCopy?: boolean;
}

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  isCopy,
}: AssetFormProps) {
  const [formData, setFormData] = useState<Omit<Asset, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    type: ASSET_TYPES[0],
    value: 0,
    purchase_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type,
        value: Number(initialData.value),
        purchase_date: new Date(initialData.purchase_date).toISOString().split('T')[0],
      });
      return;
    }

    setFormData({
      name: '',
      type: ASSET_TYPES[0],
      value: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    });
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      value: Number(formData.value),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCopy ? 'Copy Asset' : initialData ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
          <DialogDescription>
            {isCopy
              ? 'Create a new asset based on this one.'
              : initialData
                ? 'Update the asset details below.'
                : 'Create a new asset by filling in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Bitcoin, Flat, Emergency Fund..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Asset Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as Asset['type'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={Number.isFinite(formData.value) ? formData.value : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    value: e.target.value === '' ? 0 : Number(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_date">Purchase Date</Label>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Asset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
