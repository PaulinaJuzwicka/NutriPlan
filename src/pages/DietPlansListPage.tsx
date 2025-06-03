import React from 'react';

const DietPlansListPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Diet Plans</h1>
      {}
      <div className="bg-white shadow rounded p-6 text-gray-500 text-center">
        No diet plans yet.
      </div>
    </div>
  );
};

export default DietPlansListPage;
