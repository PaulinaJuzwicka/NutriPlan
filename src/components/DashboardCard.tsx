import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  trendValue: string;
  trendLabel: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  trendLabel,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="ml-1 text-sm font-medium text-gray-500">{unit}</p>
          </div>
        </div>
        <div className="p-3 rounded-full bg-gray-100">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className={`inline-flex items-center text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span>{trendValue}</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">{trendLabel}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
