import React from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface HealthMetric {
  id: string;
  type: string;
  value: number | string;
  unit: string;
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

interface HealthMetricsProps {
  metrics: HealthMetric[];
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ metrics }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-success-500';
      case 'warning':
        return 'bg-warning-500';
      case 'critical':
        return 'bg-error-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-error-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-success-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" /> Health Metrics
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-200 text-primary-800">
            Last Updated: {format(new Date(), 'MMM d, yyyy', { locale: enUS })}
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {metrics.map((metric) => (
          <div key={metric.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(metric.status)}`}></div>
                <p className="text-sm font-medium text-gray-900">{metric.type}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">
                  {metric.value} {metric.unit}
                </span>
                {getTrendIcon(metric.trend)}
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              {metric.status === 'critical' && (
                <div className="mt-1 flex items-center text-error-500">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Outside normal range - consult doctor</span>
                </div>
              )}
              
              {metric.status === 'warning' && (
                <div className="mt-1 flex items-center text-warning-500">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Above target range - monitor closely</span>
                </div>
              )}
              
              <p className="mt-1 text-xs text-gray-400">
                Recorded on {format(new Date(metric.timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View all metrics
        </button>
      </div>
    </div>
  );
};

export default HealthMetrics;