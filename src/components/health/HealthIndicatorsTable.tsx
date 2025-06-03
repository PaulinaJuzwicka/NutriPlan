import React from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Trash2 } from 'lucide-react';

interface HealthIndicator {
  id: string;
  type: string;
  value: number | string;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  referenceRange: {
    min: number;
    max: number;
  };
}

interface HealthIndicatorsTableProps {
  indicators: HealthIndicator[];
  onDelete?: (id: string) => void;
}

const HealthIndicatorsTable: React.FC<HealthIndicatorsTableProps> = ({ indicators, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (indicator: HealthIndicator) => {
    const value = typeof indicator.value === 'number' ? indicator.value : parseFloat(indicator.value as string);
    if (value < indicator.referenceRange.min) {
      return 'Too Low';
    } else if (value > indicator.referenceRange.max) {
      return 'Too High';
    }
    return 'Normal';
  };

  const formatType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" /> Health Indicators
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Indicator
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference Range
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Measurement Time
              </th>
              {onDelete && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {indicators.map((indicator) => (
              <tr key={indicator.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatType(indicator.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {indicator.value} {indicator.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(indicator.status)}`}>
                    {getStatusText(indicator)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {indicator.referenceRange.min} - {indicator.referenceRange.max} {indicator.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(indicator.timestamp).toLocaleString('en-US')}
                </td>
                {onDelete && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onDelete(indicator.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete measurement"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HealthIndicatorsTable; 