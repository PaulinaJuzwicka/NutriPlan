import React from 'react';
import { Heart, Thermometer, Activity, Droplets, AlertCircle, Info } from 'lucide-react';

const HealthRangesInfo: React.FC = () => {
  const measurements = [
    {
      type: 'cukier we krwi',
      icon: <Droplets className="w-5 h-5" />,
      description: 'Poziom glukozy we krwi',
      ranges: {
        title: 'Dla zdrowej osoby dorosłej (na czczo):',
        values: '70-99 mg/dL',
        source: 'American Diabetes Association / Polskie Towarzystwo Diabetologiczne',
        language: 'Polski / Angielski',
        link: 'https://ptdiab.pl/'
      }
    },
    {
      type: 'ciśnienie krwi',
      icon: <Heart className="w-5 h-5" />,
      description: 'Ciśnienie skurczowe/rozkurczowe',
      ranges: {
        title: 'Optymalne dla zdrowej osoby dorosłej:',
        values: '120/80 mmHg lub niższe',
        source: 'American Heart Association / Polskie Towarzystwo Nadciśnienia Tętniczego',
        language: 'Polski / Angielski',
        link: 'https://www.nadcisnienietetnicze.pl/'
      }
    },
    {
      type: 'tętno',
      icon: <Activity className="w-5 h-5" />,
      description: 'Liczba uderzeń serca na minutę',
      ranges: {
        title: 'Spoczynkowe dla zdrowej osoby dorosłej:',
        values: '60-100 bpm',
        source: 'American Heart Association',
        language: 'Angielski',
        link: 'https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates'
      }
    },
    {
      type: 'temperatura',
      icon: <Thermometer className="w-5 h-5" />,
      description: 'Temperatura ciała',
      ranges: {
        title: 'Prawidłowa dla zdrowej osoby dorosłej:',
        values: '36.0-37.2°C (97-99°F)',
        source: 'Mayo Clinic',
        language: 'Angielski',
        link: 'https://www.mayoclinic.org/first-aid/first-aid-fever/basics/art-20056685'
      }
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600">
        <h3 className="text-base font-medium text-white">
          Zakresy referencyjne
        </h3>
        <p className="text-xs text-blue-100 mt-1">
          Dla zdrowej osoby dorosłej
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-red-900 mb-1">
                ⚠️ WAŻNA INFORMACJA MEDYCZNA
              </h4>
              <p className="text-xs text-red-800 font-medium mb-1">
                NIE SAMODZIELNIE INTERPRETUJ WYNIKÓW!
              </p>
              <p className="text-xs text-red-700 mb-1">
                Wartości to <strong>referencje dla zdrowej osoby dorosłej</strong>. 
                Twoje normy mogą się różnić!
              </p>
              <p className="text-xs text-red-700">
                <strong>KONSULTUJ Z LEKARZEM</strong> przy wynikach poza zakresem
                lub chorobach przewlekłych.
              </p>
            </div>
          </div>
        </div>

        {measurements.map((item, index) => (
          <div key={index} className="border-l-2 border-gray-200 pl-3">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 text-gray-600 mr-2">
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 capitalize">
                  {item.type}
                </h4>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded space-y-1">
              <p className="text-xs font-medium text-gray-700">
                {item.ranges.title}
              </p>
              <p className="text-xs text-gray-900 font-mono">
                {item.ranges.values}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  Źródło: {item.ranges.source}
                </p>
                {item.ranges.link && (
                  <a 
                    href={item.ranges.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    title="Sprawdź źródło"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-red-900 mb-1">
                🔴 KONIECZNE DZIAŁANIE
              </h4>
              <p className="text-xs text-red-800 font-medium mb-1">
                <strong>ABSOLUTNIE ZABRANIA SIĘ:</strong>
              </p>
              <ul className="text-xs text-red-700 list-disc list-inside space-y-1 mb-1">
                <li>Samodzielnej interpretacji wyników</li>
                <li>Modyfikowania dawek leków</li>
                <li>Ignorowania niepokojących objawów</li>
              </ul>
              <p className="text-xs text-red-700">
                Aplikacja służy do <strong>zapisywania pomiarów</strong>, 
                nie do <strong>diagnostyki medycznej</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>💡 Pamiętaj:</strong> Regularne pomiary są cennym narzędziem, 
            ale ich interpretacja musi być zawsze dokonana przez lekarza.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthRangesInfo;
