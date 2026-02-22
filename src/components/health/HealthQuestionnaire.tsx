import React, { useState } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, Activity } from 'lucide-react';

interface HealthQuestionnaireProps {
  onComplete: (data: {
    chronicDiseases: string[];
    allergies: string[];
  }) => void;
}

const HealthQuestionnaire: React.FC<HealthQuestionnaireProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    chronicDiseases: [] as string[],
    allergies: [] as string[]
  });

  const chronicDiseasesOptions = [
    'Cukrzyca typu 1',
    'Cukrzyca typu 2',
    'Nadciśnienie tętnicze',
    'Choroby serca',
    'Choroby nerek',
    'Choroby wątroby',
    'Choroby tarczycy',
    'Astma',
    'Celiakia',
    'Choroba Leśniowskiego-Crohna',
    'Wrzodziejące zapalenie jelita grubego',
    'Zespół jelita drażliwego',
    'Migrena',
    'Depresja',
    'Lęk',
    'Bezsenność',
    'Osteoporoza',
    'Reumatoidalne zapalenie stawów',
    'Inne'
  ];

  const allergiesOptions = [
    'Orzechy',
    'Mleko i produkty mleczne',
    'Jaja',
    'Soja',
    'Pszenica i gluten',
    'Ryby i owoce morza',
    'Mięso',
    'Owoce cytrusowe',
    'Sezam',
    'Lateks',
    'Pyłki roślin',
    'Roztocza kurzu domowego',
    'Sierść zwierząt',
    'Użądlenia owadów',
    'Inne'
  ];

  const handleDiseaseToggle = (disease: string) => {
    setFormData(prev => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.includes(disease)
        ? prev.chronicDiseases.filter(d => d !== disease)
        : [...prev.chronicDiseases, disease]
    }));
  };

  const handleAllergyToggle = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Choroby przewlekłe';
      case 2:
        return 'Alergie';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Wybierz choroby przewlekłe, na które cierpisz. Te informacje pomogą nam dostosować Twoją dietę.';
      case 2:
        return 'Wybierz alergie pokarmowe. Pomoże nam to unikać produktów, które mogą Ci zaszkodzić.';
      default:
        return '';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chronicDiseasesOptions.map((disease) => (
                <label
                  key={disease}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary-300 hover:bg-primary-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.chronicDiseases.includes(disease)}
                    onChange={() => handleDiseaseToggle(disease)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">{disease}</span>
                </label>
              ))}
            </div>
            
            {formData.chronicDiseases.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <Activity className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-blue-800">
                      Jeśli nie masz żadnych chorób przewlekłych, po prostu kliknij "Dalej".
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allergiesOptions.map((allergy) => (
                <label
                  key={allergy}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary-300 hover:bg-primary-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.allergies.includes(allergy)}
                    onChange={() => handleAllergyToggle(allergy)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">{allergy}</span>
                </label>
              ))}
            </div>
            
            {formData.allergies.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-800">
                      Świetnie! Jeśli nie masz żadnych alergii, po prostu kliknij "Zakończ".
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
            <p className="mt-1 text-gray-600">{getStepDescription()}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Wstecz
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {currentStep === 2 ? 'Zakończ' : 'Dalej'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthQuestionnaire;
