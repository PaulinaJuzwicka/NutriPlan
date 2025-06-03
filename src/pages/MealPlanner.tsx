import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useTasteApi } from '../hooks/useTasteApi';
import MealPlanModal from '../components/meals/MealPlanModal';
import MealCalendar from '../components/meals/MealCalendar';
import { Recipe } from '../types';

const MealPlanner: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    diet: '',
    intolerances: [] as string[],
    maxReadyTime: 60,
  });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { recipes, isLoading, error, searchRecipes } = useTasteApi();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchRecipes(searchQuery, filters);
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200">
          <Plus className="w-5 h-5 mr-2" />
          Create Meal Plan
        </button>
      </div>

      <div className="mb-8">
        <MealCalendar />
      </div>

      <div className="bg-white rounded-lg shadow-card p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for recipes..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diet Type
              </label>
              <select
                value={filters.diet}
                onChange={(e) => setFilters({ ...filters, diet: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any</option>
                <option value="gluten-free">Gluten Free</option>
                <option value="ketogenic">Ketogenic</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="paleo">Paleo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Preparation Time (minutes)
              </label>
              <input
                type="number"
                value={filters.maxReadyTime}
                onChange={(e) => setFilters({ ...filters, maxReadyTime: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                min="0"
                step="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intolerances
              </label>
              <select
                multiple
                value={filters.intolerances}
                onChange={(e) => setFilters({
                  ...filters,
                  intolerances: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="dairy">Dairy</option>
                <option value="egg">Egg</option>
                <option value="gluten">Gluten</option>
                <option value="peanut">Peanut</option>
                <option value="seafood">Seafood</option>
                <option value="shellfish">Shellfish</option>
                <option value="soy">Soy</option>
                <option value="tree-nut">Tree Nut</option>
                <option value="wheat">Wheat</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md flex items-center transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search Recipes'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow-card overflow-hidden">
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{recipe.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Ready in {recipe.readyInMinutes} mins</span>
                <span>{recipe.servings} servings</span>
              </div>
              {recipe.diets && recipe.diets.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {recipe.diets.map((diet) => (
                    <span
                      key={diet}
                      className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                    >
                      {diet}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => handleAddToMealPlan(recipe)}
                className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Add to Meal Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      <MealPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRecipe={selectedRecipe}
      />
    </div>
  );
};

export default MealPlanner;