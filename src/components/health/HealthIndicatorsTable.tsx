import React, { useState, useEffect } from 'react';
import { Activity, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface HealthIndicator {
  id: string;
  typ: string;
  wartosc: number | string;
  jednostka: string;
  zmierzono_o: string;
  zakres_referencyjny: {
    min: number;
    max: number;
  };
}

interface HealthIndicatorsTableProps {
  indicators?: HealthIndicator[];
  onDelete?: (id: string) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  onFilterChange?: (filter: string) => void;
  currentFilter?: string;
}

const HealthIndicatorsTable: React.FC<HealthIndicatorsTableProps> = ({ 
  indicators, 
  onDelete, 
  itemsPerPage = 10,
  onItemsPerPageChange,
  onFilterChange,
  currentFilter = 'all'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [localItemsPerPage, setLocalItemsPerPage] = useState(itemsPerPage);
  
  // Filter indicators based on currentFilter
  const filteredIndicators = currentFilter === 'all' 
    ? indicators || []
    : (indicators || []).filter(indicator => indicator.typ === currentFilter);

  // Calculate pagination based on filtered indicators
  const totalPages = Math.ceil(filteredIndicators.length / localItemsPerPage);
  const shouldShowPagination = true; // Always show pagination
  const startIndex = (currentPage - 1) * localItemsPerPage;
  const endIndex = startIndex + localItemsPerPage;
  const currentIndicators = filteredIndicators.slice(startIndex, endIndex);

  // Sync localItemsPerPage with prop
  useEffect(() => {
    if (onItemsPerPageChange && itemsPerPage !== localItemsPerPage) {
      setLocalItemsPerPage(itemsPerPage);
      setCurrentPage(1); // Reset to first page when changing items per page
    }
  }, [itemsPerPage, onItemsPerPageChange, currentFilter]);
  
  
  const formatType = (type: string) => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!indicators || indicators.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <Activity className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Brak danych zdrowotnych</h3>
          <p className="mt-1 text-sm text-gray-500">
            Rozpocznij dodawanie pomiarów, aby śledzić swoje parametry zdrowotne
          </p>
        </div>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setLocalItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    onItemsPerPageChange?.(newItemsPerPage);
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" /> Wskaźniki zdrowotne
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange?.('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currentFilter === 'all'
                  ? 'bg-white text-primary-700'
                  : 'bg-white bg-opacity-20 text-primary-300 hover:bg-opacity-30'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => onFilterChange?.('blood-pressure')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currentFilter === 'blood-pressure'
                  ? 'bg-white text-primary-700'
                  : 'bg-white bg-opacity-20 text-primary-300 hover:bg-opacity-30'
              }`}
            >
              ❤️ Ciśnienie
            </button>
            <button
              onClick={() => onFilterChange?.('blood-sugar')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currentFilter === 'blood-sugar'
                  ? 'bg-white text-primary-700'
                  : 'bg-white bg-opacity-20 text-primary-300 hover:bg-opacity-30'
              }`}
            >
              🩸 Cukier
            </button>
            <button
              onClick={() => onFilterChange?.('pulse')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currentFilter === 'pulse'
                  ? 'bg-white text-primary-700'
                  : 'bg-white bg-opacity-20 text-primary-300 hover:bg-opacity-30'
              }`}
            >
              💓 Tętno
            </button>
            <button
              onClick={() => onFilterChange?.('temperature')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currentFilter === 'temperature'
                  ? 'bg-white text-primary-700'
                  : 'bg-white bg-opacity-20 text-primary-300 hover:bg-opacity-30'
              }`}
            >
              🌡️ Temperatura
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Typ pomiaru
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wartość
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data pomiaru
              </th>
              {onDelete && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentIndicators
              .sort((a, b) => new Date(b.zmierzono_o).getTime() - new Date(a.zmierzono_o).getTime())
              .map((indicator) => (
              <tr key={indicator.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatType(indicator.typ)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {indicator.wartosc} {indicator.jednostka}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {indicator.zmierzono_o
                    ? indicator.zmierzono_o.replace('T', ' ').substring(0, 19)
                    : 'Brak daty'}
                </td>
                {onDelete && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onDelete(indicator.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Usuń pomiar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-200 sm:px-6 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Pokaż:</span>
          <select
            value={localItemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">
            Pokazano <span className="font-medium">{filteredIndicators.length > 0 ? startIndex + 1 : 0}</span> do{' '}
            <span className="font-medium">{Math.min(endIndex, filteredIndicators.length)}</span> z{' '}
            <span className="font-medium">{filteredIndicators.length}</span> wyników
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1 || totalPages <= 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Poprzednia
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages <= 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Następna
          </button>
        </div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1 || totalPages <= 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex">
            {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages <= 1}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default HealthIndicatorsTable;
