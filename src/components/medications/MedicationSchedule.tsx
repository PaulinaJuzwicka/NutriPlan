import React, { useState } from 'react';
import { Clock, Calendar, Plus, X, Edit, Trash2 } from 'lucide-react';
import { MedicationBase as Medication } from '../../types/medications';
import { Button } from '../ui/Button';

interface MedicationScheduleProps {
  medication: Medication;
  onClose: () => void;
  onSave: (schedule: any) => void;
}

const MedicationSchedule: React.FC<MedicationScheduleProps> = ({ medication, onClose, onSave }) => {
  const [schedule, setSchedule] = useState({
    godziny_przyjmowania: medication.godziny_przyjmowania || ['08:00'],
    czy_staly: medication.czy_staly || false,
    notatki: medication.notatki || ''
  });

  const handleSave = () => {
    onSave(schedule);
    onClose();
  };

  const handleAddTime = () => {
    setSchedule(prev => ({
      ...prev,
      godziny_przyjmowania: [...prev.godziny_przyjmowania, '12:00']
    }));
  };

  const handleRemoveTime = (index: number) => {
    setSchedule(prev => ({
      ...prev,
      godziny_przyjmowania: prev.godziny_przyjmowania.filter((_, i) => i !== index)
    }));
  };

  const handleTimeChange = (index: number, value: string) => {
    setSchedule(prev => ({
      ...prev,
      godziny_przyjmowania: prev.godziny_przyjmowania.map((time, i) => i === index ? value : time)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Harmonogram przyjmowania</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Godziny przyjmowania */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Godziny przyjmowania
            </label>
            <div className="space-y-2">
              {schedule.godziny_przyjmowania.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveTime(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddTime}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj godzinę
              </Button>
            </div>
          </div>

          {/* Czy stały */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={schedule.czy_staly}
                onChange={(e) => setSchedule(prev => ({ ...prev, czy_staly: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Lek stały</span>
            </label>
          </div>

          {/* Notatki */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notatki
            </label>
            <textarea
              value={schedule.notatki}
              onChange={(e) => setSchedule(prev => ({ ...prev, notatki: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dodatkowe notatki..."
            />
          </div>

          {/* Przyciski */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSave}
            >
              Zapisz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationSchedule;
