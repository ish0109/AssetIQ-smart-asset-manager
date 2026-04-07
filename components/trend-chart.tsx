'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChartIcon, TrendingUp } from 'lucide-react';

type ChartType = 'line' | 'bar' | 'area';

interface TrendData {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: TrendData[];
  title?: string;
}

export function TrendChart({ data, title = 'Portfolio Growth' }: TrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');

  const chartTypes: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { type: 'area', icon: <TrendingUp className="h-4 w-4" />, label: 'Area' },
    { type: 'line', icon: <LineChartIcon className="h-4 w-4" />, label: 'Line' },
    { type: 'bar', icon: <BarChart3 className="h-4 w-4" />, label: 'Bar' },
  ];

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            No asset trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const commonProps = {
    data,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Bar dataKey="value" name="Portfolio Value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Area type="monotone" dataKey="value" name="Portfolio Value" stroke="#2563eb" fill="#60a5fa" fillOpacity={0.35} />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center gap-1">
          {chartTypes.map(({ type, icon, label }) => (
            <Button
              key={type}
              variant={chartType === type ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType(type)}
              className="gap-1"
              title={label}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
