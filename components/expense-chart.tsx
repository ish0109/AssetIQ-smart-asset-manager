'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1'];

interface ExpenseChartProps {
  data: { category: string; total: number }[];
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Asset Distribution</h3>
        <p className="text-gray-500 text-center py-8">No asset data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Asset Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => entry.category}
            outerRadius={100}
            fill="#8884d8"
            dataKey="total"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
