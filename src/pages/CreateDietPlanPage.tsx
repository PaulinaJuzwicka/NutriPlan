import React from 'react';

const CreateDietPlanPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create Diet Plan</h1>
      {}
      <form>
        {}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Plan Name</label>
          <input type="text" className="border rounded px-3 py-2 w-full" />
        </div>
        {}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Daily Calories</label>
          <input type="number" className="border rounded px-3 py-2 w-full" />
        </div>
        {}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Allergens to avoid</label>
          {}
        </div>
        {}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Plan</button>
      </form>
    </div>
  );
};

export default CreateDietPlanPage;
