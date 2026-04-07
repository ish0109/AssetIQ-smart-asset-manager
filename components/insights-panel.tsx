'use client';

import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface InsightsPanelProps {
  insights: string[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Smart Insights</h3>
      </div>
      <div className="grid gap-3">
        {insights.map((insight, index) => (
          <div key={`${insight}-${index}`} className="rounded-lg border bg-amber-50/70 px-4 py-3 text-sm text-slate-700">
            {insight}
          </div>
        ))}
      </div>
    </Card>
  );
}
