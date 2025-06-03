import React from 'react';
import { Info } from 'lucide-react';

interface DietaryTipsProps {
  condition: string;
}

const TIPS: Record<string, string> = {
  diabetes: 'Tips are tailored to your dietary preferences and restrictions.',
  hypertension: 'Limit your sodium intake to 5g per day. Choose products rich in potassium, magnesium, and calcium.',
  celiac: 'Avoid products containing wheat, rye, barley, and oats. Choose products labeled as gluten-free.',
  'lactose intolerance': 'Choose lactose-free or low-lactose products. You can also opt for plant-based milk enriched with calcium.',
};

const CONDITION_NAMES: Record<string, string> = {
  diabetes: 'diabetes',
  hypertension: 'hypertension',
  celiac: 'celiac disease',
  'lactose intolerance': 'lactose intolerance',
};

export const DietaryTips: React.FC<DietaryTipsProps> = ({ condition }) => {
  const tip = TIPS[condition.toLowerCase()];
  const conditionName = CONDITION_NAMES[condition.toLowerCase()] || condition;
  
  if (!tip) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Dietary Tips for {conditionName}</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>Show more</p>
          </div>
        </div>
      </div>
    </div>
  );
};
