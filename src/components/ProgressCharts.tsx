import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrainingSession } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProgressChartsProps {
  sessions: TrainingSession[];
  weeklyProgress: any[];
  cumulativeStats: any[];
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({ 
  sessions, 
  weeklyProgress, 
  cumulativeStats 
}) => {
  // Weekly completion chart
  const weeklyCompletionData = {
    labels: weeklyProgress.map(w => `Woche ${w.week}`),
    datasets: [
      {
        label: 'Abgeschlossene Sessions',
        data: weeklyProgress.map(w => w.completedSessions),
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Geplante Sessions',
        data: weeklyProgress.map(w => w.totalSessions),
        backgroundColor: 'rgba(229, 231, 235, 0.5)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  };

  // Cumulative distance chart
  const cumulativeDistanceData = {
    labels: cumulativeStats.map((_, index) => `Session ${index + 1}`),
    datasets: [
      {
        label: 'Gesamt-Distanz (km)',
        data: cumulativeStats.map(stat => stat.distance),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  // Strength vs Cardio balance
  const balanceData = {
    labels: weeklyProgress.map(w => `W${w.week}`),
    datasets: [
      {
        label: 'Kraft (%)',
        data: weeklyProgress.map(w => w.strengthPercentage),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
      {
        label: 'Ausdauer (%)',
        data: weeklyProgress.map(w => w.cardioPercentage),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      }
    ]
  };

  // Training duration per week
  const durationData = {
    labels: weeklyProgress.map(w => `Woche ${w.week}`),
    datasets: [
      {
        label: 'Trainingszeit (Stunden)',
        data: weeklyProgress.map(w => w.totalDuration / 60),
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Completion */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Wöchentliche Vollendung
          </h3>
          <div className="h-64">
            <Bar data={weeklyCompletionData} options={chartOptions} />
          </div>
        </div>

        {/* Cumulative Distance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Kumulative Distanz
          </h3>
          <div className="h-64">
            <Line data={cumulativeDistanceData} options={lineChartOptions} />
          </div>
        </div>

        {/* Strength vs Cardio Balance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Kraft vs. Ausdauer Balance
          </h3>
          <div className="h-64">
            <Bar data={balanceData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  max: 100,
                },
              },
            }} />
          </div>
        </div>

        {/* Training Duration */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Wöchentliche Trainingszeit
          </h3>
          <div className="h-64">
            <Bar data={durationData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Zusammenfassung seit Start
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {sessions.filter(s => s.completed && s.type === 'cardio' && s.subtype === 'running').reduce((sum, s) => sum + (s.distance || 0), 0).toFixed(1)} km
            </div>
            <div className="text-sm text-gray-600">🏃‍♂️ Gelaufen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {sessions.filter(s => s.completed && (s.type === 'cardio' && s.subtype === 'cycling' || s.subtype === 'intervals')).reduce((sum, s) => sum + (s.distance || 0), 0).toFixed(1)} km
            </div>
            <div className="text-sm text-gray-600">🚴‍♂️ Radgefahren</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600 mb-1">
              {(sessions.filter(s => s.completed && s.type === 'swimming').reduce((sum, s) => sum + (s.distance || 0), 0) * 1000).toFixed(0)} m
            </div>
            <div className="text-sm text-gray-600">🏊‍♂️ Geschwommen</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCharts;
