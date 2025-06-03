import React from 'react';
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
import { HealthEntry } from '../../services/healthService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HealthChartProps {
  entries: HealthEntry[];
  type: 'blood-sugar' | 'blood-pressure' | 'pulse' | 'temperature';
}

const HealthChart: React.FC<HealthChartProps> = ({ entries, type }) => {
  const getChartTitle = () => {
    switch (type) {
      case 'blood-pressure':
        return 'Blood Pressure';
      case 'blood-sugar':
        return 'Blood Sugar';
      case 'pulse':
        return 'Pulse';
      case 'temperature':
        return 'Temperature';
      default:
        return '';
    }
  };

  const getChartData = () => {
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );

    const labels = sortedEntries.map(entry => 
      new Date(entry.measured_at).toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    let datasets = [];

    if (type === 'blood-pressure') {
      const systolicValues = sortedEntries.map(entry => {
        const [systolic] = (entry.value as string).split('/').map(Number);
        return systolic;
      });
      const diastolicValues = sortedEntries.map(entry => {
        const [, diastolic] = (entry.value as string).split('/').map(Number);
        return diastolic;
      });

      datasets = [
        {
          label: 'Systolic Pressure',
          data: systolicValues,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.4,
        },
        {
          label: 'Diastolic Pressure',
          data: diastolicValues,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.4,
        },
      ];
    } else {
      const values = sortedEntries.map(entry => Number(entry.value));
      datasets = [
        {
          label: getChartTitle(),
          data: values,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4,
        },
      ];
    }

    return {
      labels,
      datasets,
    };
  };

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
      <Line options={options} data={getChartData()} />
    </div>
  );
};

export default HealthChart; 