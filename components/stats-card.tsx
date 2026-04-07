'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'green' | 'red' | 'blue';
  format?: 'currency' | 'number';
}

export function StatsCard({ title, value, icon: Icon, color, format = 'currency' }: StatsCardProps) {
  const colorMap = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {format === 'currency' ? `$${value.toFixed(2)}` : Math.round(value).toString()}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
