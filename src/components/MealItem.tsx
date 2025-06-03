import React from 'react';
import { Clock } from 'lucide-react';

interface MealItemProps {
  name: string;
  time: string;
  calories: number;
  macros: string;
}

const MealItem: React.FC<MealItemProps> = ({ name, time, calories, macros }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div>
        <h4 className="font-medium text-gray-900">{name}</h4>
        <div className="flex items-center mt-1 text-sm text-gray-500">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{time}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">{calories} kcal</p>
        <p className="text-sm text-gray-500">{macros}</p>
      </div>
    </div>
  );
};

export default MealItem;
