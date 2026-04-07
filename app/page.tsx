'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, ShieldAlert, TrendingUp, Wallet } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { UserHeader } from '@/components/user-header';
import { StatsCard } from '@/components/stats-card';
import { ChartSelector } from '@/components/chart-selector';
import { TrendChart } from '@/components/trend-chart';
import { RecentTransactions } from '@/components/recent-transactions';
import { InsightsNotifications } from '@/components/insights-notifications';
import { Button } from '@/components/ui/button';
import {
  Asset,
  DashboardStats,
  fetchAssetDistribution,
  fetchAssets,
  fetchDashboardStats,
  fetchInsights,
  fetchRecentAssets,
} from '@/lib/transactions';
import { useAuth } from '@/lib/auth-context';

function generateTrendData(assets: Asset[]) {
  const sortedAssets = [...assets].sort((a, b) => a.purchase_date.localeCompare(b.purchase_date));
  let runningTotal = 0;

  return sortedAssets.map((asset) => {
    runningTotal += Number(asset.value || 0);
    return {
      date: new Date(asset.purchase_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: runningTotal,
    };
  });
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Asset[]>([]);
  const [distribution, setDistribution] = useState<{ category: string; total: number }[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; value: number }[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, recentData, distributionData, allAssets, insightsData] = await Promise.all([
          fetchDashboardStats(user?.id),
          fetchRecentAssets(user?.id),
          fetchAssetDistribution(user?.id),
          fetchAssets({ limit: 250 }, user?.id),
          fetchInsights(user?.id),
        ]);

        setStats(statsData);
        setRecent(recentData);
        setDistribution(distributionData);
        setTrendData(generateTrendData(allAssets));
        setInsights(insightsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">AssetIQ - Smart Asset Manager</h1>
                <p className="text-sm text-slate-600">Track assets, liabilities, and net worth in one place</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <InsightsNotifications insights={insights} />
              <Link href="/assets">
                <Button variant="outline" size="sm">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Manage Portfolio
                </Button>
              </Link>
              <UserHeader />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatsCard title="Total Assets" value={stats?.totalAssets || 0} icon={TrendingUp} color="green" />
          <StatsCard title="Total Liabilities" value={stats?.totalLiabilities || 0} icon={ShieldAlert} color="red" />
          <StatsCard title="Net Worth" value={stats?.netWorth || 0} icon={Wallet} color="blue" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
          <ChartSelector data={distribution} title="Asset Distribution" />
          <TrendChart data={trendData} title="Portfolio Growth" />
        </div>

        <div className="grid grid-cols-1">
          <RecentTransactions transactions={recent} />
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
