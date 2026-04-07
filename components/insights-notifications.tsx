'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InsightsNotificationsProps {
  insights: string[];
}

export function InsightsNotifications({ insights }: InsightsNotificationsProps) {
  const count = insights.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5 text-slate-600" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
          <span className="sr-only">Open insights notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] rounded-xl border border-slate-200 bg-slate-50 p-0 shadow-lg">
        <DropdownMenuLabel className="px-4 py-3 text-sm font-semibold text-slate-900">
          Smart Insights
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200" />
        <div className="max-h-80 overflow-y-auto p-3">
          {count === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
              No new insights yet.
            </div>
          ) : (
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={`${insight}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
                >
                  {insight}
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
