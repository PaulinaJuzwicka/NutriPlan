import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Calendar, Clock, Bell, Check, X, Plus, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';

interface MedicationSchedulerProps {
  medicationId: string;
  medicationName: string;
  onClose: () => void;
}

interface ScheduledDose {
  id: string;
  time: string;
  taken: boolean;
  notes?: string;
}

interface MedicationSchedule {
  id: string;
  nazwa: string;
  dawka: string;
  czestotnosc: string;
  forma: string;
  godziny_przyjmowania: string[];
  aktywny: boolean;
  notatki?: string;
}

export default function MedicationScheduler({ medicationId, medicationName, onClose }: MedicationSchedulerProps) {
  const [schedule, setSchedule] = useState<MedicationSchedule | null>(null);
  const [scheduledDoses, setScheduledDoses] = useState<ScheduledDose[]>([]);
  const [editingDose, setEditingDose] = useState<string | null>(null);
  const [doseNotes, setDoseNotes] = useState('');
  const [showAddDoseForm, setShowAddDoseForm] = useState(false);

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'
  ];

  const weekDays = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

  useEffect(() => {
    // Symulacja pobierania danych leku
    const mockSchedule: MedicationSchedule = {
      id: medicationId,
      nazwa: medicationName,
      dawka: '100mg',
      czestotnosc: 'raz dziennie',
      forma: 'tabletki',
      godziny_przyjmowania: ['08:00', '20:00'],
      aktywny: true,
      notatki: 'Przyjmować po posiłku'
    };

    const mockDoses: ScheduledDose[] = mockSchedule.godziny_przyjmowania.map((time, index) => ({
      id: `${medicationId}-${time}`,
      time,
      taken: Math.random() > 0.8, // Symulacja losowego statusu przyjęcia
      notes: index === 0 ? 'Przyjęto z wodą' : ''
    }));

    setSchedule(mockSchedule);
    setScheduledDoses(mockDoses);
  }, [medicationId, medicationName]);

  const handleAddDose = () => {
    if (!editingDose) return;

    const newDose: ScheduledDose = {
      id: `${medicationId}-${editingDose}`,
      time: editingDose,
      taken: false,
      notes: doseNotes
    };

    setScheduledDoses([...scheduledDoses, newDose].sort((a, b) => a.time.localeCompare(b.time)));
    setEditingDose(null);
    setDoseNotes('');
    setShowAddDoseForm(false);
  };

  const handleToggleDose = (doseId: string) => {
    setScheduledDoses(prev => 
      prev.map(dose => 
        dose.id === doseId 
          ? { ...dose, taken: !dose.taken }
          : dose
      )
    );
  };

  const handleDeleteDose = (doseId: string) => {
    setScheduledDoses(prev => prev.filter(dose => dose.id !== doseId));
  };

  const handleEditDose = (doseId: string) => {
    const dose = scheduledDoses.find(d => d.id === doseId);
    if (dose) {
      setEditingDose(dose.time);
      setDoseNotes(dose.notes || '');
      setShowAddDoseForm(true);
    }
  };

  const handleSaveSchedule = () => {
    // Symulacja zapisu harmonogramu
    onClose();
  };

  const getTodayDoses = () => {
    const today = new Date().toISOString().split('T')[0];
    return scheduledDoses.filter(dose => {
      const doseDate = dose.id.split('-')[0];
      return doseDate === today;
    });
  };

  const getAdherenceRate = () => {
    const todayDoses = getTodayDoses();
    if (todayDoses.length === 0) return 100;
    const takenCount = todayDoses.filter(dose => dose.taken).length;
    return Math.round((takenCount / todayDoses.length) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Harmonogram przyjmowania
          </h2>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">
              {medicationName}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {schedule && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      {schedule.nazwa}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {schedule.dawka} - {schedule.forma}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    schedule.aktywny ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.aktywny ? 'Aktywny' : 'Nieaktywny'}
                  </div>
                </div>
                {schedule.notatki && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Notatki:</strong> {schedule.notatki}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Dzisiejsze przyjęcia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Dziś:</span>
                        <span className="text-sm font-medium">
                          {getTodayDoses().length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Przyjęte:</span>
                        <span className="text-sm font-medium text-green-600">
                          {getTodayDoses().filter(d => d.taken).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Stopień:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {getAdherenceRate()}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Planowane dzisia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {weekDays.map((day, index) => {
                        const dayDoses = scheduledDoses.filter(dose => {
                          const doseDate = dose.id.split('-')[0];
                          const dayIndex = new Date(doseDate).getDay();
                          return dayIndex === index;
                        });
                        return (
                          <div key={day} className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm font-medium">{day}</span>
                            <div className="flex gap-2">
                              {dayDoses.map((dose, doseIndex) => (
                                <button
                                  key={dose.id}
                                  onClick={() => handleToggleDose(dose.id)}
                                  className={`w-8 h-8 rounded-full text-xs font-medium ${
                                    dose.taken
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {dose.time}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Zarządzaj harmonogram
                  </h3>
                  <Button
                    onClick={() => setShowAddDoseForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj dawkę
                  </Button>
                </div>

                {showAddDoseForm && (
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {editingDose ? 'Edytuj dawkę' : 'Dodaj nową dawkę'}
                      </h4>
                      <button
                        onClick={() => {
                          setEditingDose(null);
                          setDoseNotes('');
                          setShowAddDoseForm(false);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="doseTime">Godzina</Label>
                        <Select
                          value={editingDose || ''}
                          onValueChange={(value) => setEditingDose(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz godzinę" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="doseNotes">Notatki (opcjonalnie)</Label>
                        <Input
                          id="doseNotes"
                          value={doseNotes}
                          onChange={(e) => setDoseNotes(e.target.value)}
                          placeholder="Dodaj notatki dla tej dawki"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => setShowAddDoseForm(false)}
                          variant="outline"
                        >
                          Anuluj
                        </Button>
                        <Button onClick={handleAddDose}>
                          {editingDose ? 'Zapisz' : 'Dodaj'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {scheduledDoses.map((dose) => (
                    <div key={dose.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{dose.time}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleDose(dose.id)}
                            className={`w-8 h-8 rounded-full text-xs font-medium ${
                              dose.taken
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {dose.taken ? '✓' : '○'}
                          </button>
                          <button
                            onClick={() => handleEditDose(dose.id)}
                            className="w-8 h-8 rounded-full text-xs font-medium bg-blue-500 text-white hover:bg-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDose(dose.id)}
                            className="w-8 h-8 rounded-full text-xs font-medium bg-red-500 text-white hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {dose.notes && (
                          <span className="text-sm text-gray-500 ml-4">
                            {dose.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Anuluj
                </Button>
                <Button onClick={handleSaveSchedule}>
                  Zapisz harmonogram
                </Button>
              </div>
            </>
          )}

          {!schedule && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Ładowanie danych harmonogramu...</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
          <Button onClick={onClose}>
            Zamknij
          </Button>
        </div>
      </div>
    </div>
  );
}
