'use client';

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PieChartIcon, BarChart3, LineChartIcon, TableIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

type ChartType = 'pie' | 'bar' | 'line' | 'area' | 'table';

interface ChartData {
  category: string;
  total: number;
}

interface ChartSelectorProps {
  data: ChartData[];
  title?: string;
}

export function ChartSelector({ data, title = 'Asset Distribution' }: ChartSelectorProps) {
  const [chartType, setChartType] = useState<ChartType>('pie');

  const chartTypes: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { type: 'pie', icon: <PieChartIcon className="h-4 w-4" />, label: 'Pie' },
    { type: 'bar', icon: <BarChart3 className="h-4 w-4" />, label: 'Bar' },
    { type: 'line', icon: <LineChartIcon className="h-4 w-4" />, label: 'Line' },
    { type: 'area', icon: <TrendingUp className="h-4 w-4" />, label: 'Area' },
    { type: 'table', icon: <TableIcon className="h-4 w-4" />, label: 'Table' },
  ];

  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-slate-500">
          No data available
        </div>
      );
    }

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
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
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'table':
        const total = data.reduce((sum, item) => sum + item.total, 0);
        return (
          <div className="max-h-[300px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {item.category}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {total > 0 ? ((item.total / total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold bg-slate-50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">${total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        );

      default:
        return null;
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
