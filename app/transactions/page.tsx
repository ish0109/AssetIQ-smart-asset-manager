'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ShieldAlert, Wallet } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { UserHeader } from '@/components/user-header';
import { TransactionTable } from '@/components/transaction-table';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionSummary } from '@/components/transaction-summary';
import { LiabilityForm } from '@/components/liability-form';
import { LiabilityTable } from '@/components/liability-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Asset,
  ASSET_TYPES,
  Liability,
  LIABILITY_TYPES,
  createAsset,
  createLiability,
  deleteAsset,
  deleteLiability,
  fetchAssets,
  fetchDashboardStats,
  fetchLiabilities,
  updateAsset,
} from '@/lib/transactions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

function AssetsContent() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [liabilityTotal, setLiabilityTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [liabilityFormOpen, setLiabilityFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [copiedAsset, setCopiedAsset] = useState<Asset | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [liabilityTypeFilter, setLiabilityTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liabilitySearchQuery, setLiabilitySearchQuery] = useState('');

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    void loadPortfolioData();
  }, [typeFilter, searchQuery, liabilityTypeFilter, liabilitySearchQuery, user?.id]);

  async function loadPortfolioData() {
    try {
      setLoading(true);
      const [assetsData, liabilitiesData, stats] = await Promise.all([
        fetchAssets(
          {
            type: typeFilter !== 'all' ? typeFilter : undefined,
            search: searchQuery || undefined,
          },
          user?.id
        ),
        fetchLiabilities(
          {
            type: liabilityTypeFilter !== 'all' ? liabilityTypeFilter : undefined,
            search: liabilitySearchQuery || undefined,
          },
          user?.id
        ),
        fetchDashboardStats(user?.id),
      ]);

      setAssets(assetsData);
      setLiabilities(liabilitiesData);
      setLiabilityTotal(stats.totalLiabilities);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAsset(data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) {
    try {
      setFormLoading(true);
      await createAsset(data, user?.id);
      setAssetFormOpen(false);
      await loadPortfolioData();
      toast({ title: 'Success', description: 'Asset added successfully' });
    } catch (error) {
      console.error('Failed to create asset:', error);
      toast({ title: 'Error', description: 'Failed to add asset', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEditAsset(data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) {
    if (!editingAsset) return;

    try {
      setFormLoading(true);
      await updateAsset(editingAsset.id, data, user?.id);
      setAssetFormOpen(false);
      setEditingAsset(null);
      await loadPortfolioData();
      toast({ title: 'Success', description: 'Asset updated successfully' });
    } catch (error) {
      console.error('Failed to update asset:', error);
      toast({ title: 'Error', description: 'Failed to update asset', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteAsset(id: string) {
    try {
      await deleteAsset(id, user?.id);
      await loadPortfolioData();
      toast({ title: 'Success', description: 'Asset deleted successfully' });
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast({ title: 'Error', description: 'Failed to delete asset', variant: 'destructive' });
    }
  }

  async function handleAddLiability(data: Omit<Liability, 'id' | 'created_at' | 'updated_at'>) {
    try {
      setFormLoading(true);
      await createLiability(data, user?.id);
      setLiabilityFormOpen(false);
      await loadPortfolioData();
      toast({ title: 'Success', description: 'Liability added successfully' });
    } catch (error) {
      console.error('Failed to create liability:', error);
      toast({ title: 'Error', description: 'Failed to add liability', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteLiability(id: string) {
    try {
      await deleteLiability(id, user?.id);
      await loadPortfolioData();
      toast({ title: 'Success', description: 'Liability deleted successfully' });
    } catch (error) {
      console.error('Failed to delete liability:', error);
      toast({ title: 'Error', description: 'Failed to delete liability', variant: 'destructive' });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Portfolio Manager</h1>
                  <p className="text-sm text-slate-600">Manage your assets and liabilities together</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setLiabilityFormOpen(true)}
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Add Liability
              </Button>
              <Button
                onClick={() => {
                  setEditingAsset(null);
                  setCopiedAsset(null);
                  setAssetFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
              <UserHeader />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!loading && <TransactionSummary transactions={assets} liabilitiesTotal={liabilityTotal} />}

        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Assets</h2>
              <p className="text-sm text-slate-600">Track what you own across all asset classes.</p>
            </div>
          </div>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Asset Types</SelectItem>
                {ASSET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-600">Loading assets...</p>
            </div>
          ) : (
            <TransactionTable
              transactions={assets}
              onEdit={(asset) => {
                setEditingAsset(asset);
                setCopiedAsset(null);
                setAssetFormOpen(true);
              }}
              onDelete={handleDeleteAsset}
              onCopy={(asset) => {
                setCopiedAsset(asset);
                setEditingAsset(asset);
                setAssetFormOpen(true);
              }}
            />
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Liabilities</h2>
              <p className="text-sm text-slate-600">Current total liabilities: ${liabilityTotal.toFixed(2)}</p>
            </div>
          </div>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <Input
              placeholder="Search liabilities..."
              value={liabilitySearchQuery}
              onChange={(e) => setLiabilitySearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={liabilityTypeFilter} onValueChange={setLiabilityTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Liability Types</SelectItem>
                {LIABILITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-600">Loading liabilities...</p>
            </div>
          ) : (
            <LiabilityTable liabilities={liabilities} onDelete={handleDeleteLiability} />
          )}
        </div>
      </main>

      <TransactionForm
        isOpen={assetFormOpen}
        onClose={() => {
          setAssetFormOpen(false);
          setEditingAsset(null);
          setCopiedAsset(null);
        }}
        onSubmit={copiedAsset ? handleAddAsset : editingAsset ? handleEditAsset : handleAddAsset}
        initialData={editingAsset || undefined}
        isLoading={formLoading}
        isCopy={!!copiedAsset}
      />

      <LiabilityForm
        isOpen={liabilityFormOpen}
        onClose={() => setLiabilityFormOpen(false)}
        onSubmit={handleAddLiability}
        isLoading={formLoading}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <AssetsContent />
    </AuthGuard>
  );
}
