'use client';

import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  unit?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: 'up' | 'down' | 'neutral';
}

const colorClasses = {
  blue: 'from-blue-50 to-blue-100 border-blue-200',
  green: 'from-green-50 to-green-100 border-green-200',
  purple: 'from-purple-50 to-purple-100 border-purple-200',
  orange: 'from-orange-50 to-orange-100 border-orange-200',
  red: 'from-red-50 to-red-100 border-red-200',
};

const iconBgClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
};

const trendClasses = {
  up: 'text-green-600 bg-green-50',
  down: 'text-red-600 bg-red-50',
  neutral: 'text-gray-600 bg-gray-50',
};

export function KPICard({
  title,
  value,
  change,
  unit,
  icon,
  color = 'blue',
  trend = 'neutral',
}: KPICardProps) {
  return (
    <div className={cn('bg-gradient-to-br p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all', colorClasses[color])}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-xl', iconBgClasses[color])}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold', trendClasses[trend])}>
            {trend === 'up' && <ArrowUp className="w-3 h-3" />}
            {trend === 'down' && <ArrowDown className="w-3 h-3" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm font-semibold mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black text-gray-900">{value}</p>
        {unit && <p className="text-gray-500 text-sm font-medium">{unit}</p>}
      </div>

      {change !== undefined && (
        <p className="text-xs text-gray-600 mt-3">
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}{' '}
          {trend === 'up' ? 'زيادة' : trend === 'down' ? 'انخفاض' : 'بدون تغيير'} مقارنة بالشهر الماضي
        </p>
      )}
    </div>
  );
}
