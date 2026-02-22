import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HealthEntry, HealthEntryType } from '../../services/healthService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface HealthChartProps {
  entries?: HealthEntry[];
  type: HealthEntryType;
}

const HealthChart: React.FC<HealthChartProps> = ({ entries, type }) => {
  const getChartTitle = () => {
    switch (type) {
      case 'blood-pressure':
        return 'Ciśnienie krwi';
      case 'blood-sugar':
        return 'Poziom cukru';
      case 'pulse':
        return 'Tętno';
      case 'temperature':
        return 'Temperatura';
      default:
        return '';
    }
  };

  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) {
      return { labels: [], datasets: [] };
    }

    const chartEntries = entries
      .filter((entry) => entry.typ === type)
      .map((entry) => ({
        ...entry,
        date: new Date(entry.zmierzono_o),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const labels = chartEntries.map((entry) =>
      entry.date.toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    );

    let datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string; tension?: number }[] = [];

    if (type === 'blood-pressure') {
      const systolicData = chartEntries
        .map((entry) => {
          if (typeof entry.wartosc === 'string' && entry.wartosc.includes('/')) {
            return parseInt(entry.wartosc.split('/')[0]);
          }
          return null;
        })
        .filter((v) => v !== null);

      const diastolicData = chartEntries
        .map((entry) => {
          if (typeof entry.wartosc === 'string' && entry.wartosc.includes('/')) {
            return parseInt(entry.wartosc.split('/')[1]);
          }
          return null;
        })
        .filter((v) => v !== null);

      datasets = [
        {
          label: 'Ciśnienie skurczowe (mmHg)',
          data: systolicData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Ciśnienie rozkurczowe',
          data: diastolicData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1,
        },
      ];
    } else if (type === 'blood-sugar') {
      datasets = [
        {
          label: 'Poziom cukru',
          data: chartEntries.map((entry) => {
            const value = typeof entry.wartosc === 'number' ? entry.wartosc : parseFloat(entry.wartosc);
            return value;
          }),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
      ];
    } else if (type === 'pulse') {
      datasets = [
        {
          label: 'Tętno',
          data: chartEntries.map((entry) => {
            const value = typeof entry.wartosc === 'number' ? entry.wartosc : parseFloat(entry.wartosc);
            return value;
          }),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
      ];
    } else if (type === 'temperature') {
      datasets = [
        {
          label: 'Temperatura',
          data: chartEntries.map((entry) => {
            const value = typeof entry.wartosc === 'number' ? entry.wartosc : parseFloat(entry.wartosc);
            return value;
          }),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
      ];
    } else {
      const data = chartEntries
        .map((entry) => {
          const value = typeof entry.wartosc === 'number' ? entry.wartosc : parseFloat(entry.wartosc);
          return isNaN(value) ? null : value;
        })
        .filter((v) => v !== null);

      datasets = [
        {
          label: getChartTitle(),
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
      ];
    }

    return {
      labels: labels.slice(0, datasets[0]?.data?.length || 0),
      datasets: datasets,
    };
  }, [entries, type]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: getChartTitle(),
      },
    },
    scales: {
      x: {
        reverse: false,
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-4">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default HealthChart;
