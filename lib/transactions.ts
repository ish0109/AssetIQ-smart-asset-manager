export interface Asset {
  id: string;
  user_id?: string;
  name: string;
  type: 'Savings' | 'Property' | 'Stocks' | 'Crypto' | 'Gold' | 'Investments';
  value: number;
  purchase_date: string;
  created_at: string;
  updated_at?: string;
}

export interface Liability {
  id: string;
  user_id?: string;
  name: string;
  type: 'Loan' | 'Credit Card' | 'EMI' | 'Other';
  amount: number;
  due_date: string;
  created_at: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetCount: number;
  liabilityCount: number;
}

function buildUserHeaders(userId?: string): HeadersInit {
  return userId ? { 'user-id': userId } : {};
}

export async function fetchAssets(
  filters: {
    type?: string;
    search?: string;
    limit?: number;
  },
  userId?: string
): Promise<Asset[]> {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (userId) params.append('user_id', userId);

  const response = await fetch(`/api/assets?${params}`, {
    headers: buildUserHeaders(userId),
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch assets');
  return response.json();
}

export async function createAsset(
  data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>,
  userId?: string
): Promise<Asset> {
  const response = await fetch('/api/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildUserHeaders(userId) },
    credentials: 'include',
    body: JSON.stringify({ ...data, value: Number(data.value), user_id: userId }),
  });

  if (!response.ok) throw new Error('Failed to create asset');
  return response.json();
}

export async function updateAsset(id: string, data: Partial<Asset>, userId?: string): Promise<Asset> {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...buildUserHeaders(userId) },
    credentials: 'include',
    body: JSON.stringify({
      ...data,
      value: data.value !== undefined ? Number(data.value) : undefined,
      user_id: userId,
    }),
  });

  if (!response.ok) throw new Error('Failed to update asset');
  return response.json();
}

export async function deleteAsset(id: string, userId?: string): Promise<void> {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...buildUserHeaders(userId) },
    credentials: 'include',
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) throw new Error('Failed to delete asset');
}

export async function fetchLiabilities(
  filters: {
    type?: string;
    search?: string;
    limit?: number;
  } = {},
  userId?: string
): Promise<Liability[]> {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (userId) params.append('user_id', userId);

  const response = await fetch(`/api/liabilities?${params}`, {
    headers: buildUserHeaders(userId),
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch liabilities');
  return response.json();
}

export async function createLiability(
  data: Omit<Liability, 'id' | 'created_at' | 'updated_at'>,
  userId?: string
): Promise<Liability> {
  const response = await fetch('/api/liabilities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildUserHeaders(userId) },
    credentials: 'include',
    body: JSON.stringify({ ...data, amount: Number(data.amount), user_id: userId }),
  });

  if (!response.ok) throw new Error('Failed to create liability');
  return response.json();
}

export async function deleteLiability(id: string, userId?: string): Promise<void> {
  const response = await fetch(`/api/liabilities/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...buildUserHeaders(userId) },
    credentials: 'include',
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) throw new Error('Failed to delete liability');
}

export async function fetchDashboardStats(userId?: string): Promise<DashboardStats> {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);

  const response = await fetch(`/api/dashboard/stats?${params}`, {
    headers: buildUserHeaders(userId),
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
}

export async function fetchRecentAssets(userId?: string): Promise<Asset[]> {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);

  const response = await fetch(`/api/dashboard/recent?${params}`, {
    headers: buildUserHeaders(userId),
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch recent assets');
  return response.json();
}

export async function fetchAssetDistribution(
  userId?: string
): Promise<{ category: string; total: number }[]> {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);

  const response = await fetch(`/api/dashboard/distribution?${params}`, {
    headers: buildUserHeaders(userId),
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch asset distribution');
  return response.json();
}

export async function fetchInsights(userId?: string): Promise<string[]> {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);

  const response = await fetch(`/api/insights?${params}`, {
    headers: buildUserHeaders(userId),
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch insights');
  return response.json();
}

export const ASSET_TYPES = [
  'Savings',
  'Property',
  'Stocks',
  'Crypto',
  'Gold',
  'Investments',
] as const;

export const LIABILITY_TYPES = [
  'Loan',
  'Credit Card',
  'EMI',
  'Other',
] as const;
