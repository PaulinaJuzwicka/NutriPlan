import React from 'react';

interface MacroNutrientProps {
  name: string;
  amount: string;
  goal: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'indigo' | 'purple' | 'pink';
  percentage: number;
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

const MacroNutrient: React.FC<MacroNutrientProps> = ({
  name,
  amount,
  goal,
  color,
  percentage,
}) => {
  const colorClass = colorMap[color] || 'bg-gray-500';
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{name}</span>
        <span className="text-gray-500">
          {amount} / {goal}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default MacroNutrient;
