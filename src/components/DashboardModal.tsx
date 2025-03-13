import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BarChart2, ChevronDown, Lock, Calendar, Users, Filter } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
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
  ChartData
} from 'chart.js';
import type { Estimation } from '../types';

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

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimations: Estimation[];
}

interface CommercialStats {
  [key: string]: number;
}

interface MonthlyCommercialStats {
  [key: string]: {
    [commercial: string]: number;
  };
}

const STATS_PIN = '1010';

export function DashboardModal({
  isOpen,
  onClose,
  estimations
}: DashboardModalProps) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [filteredEstimations, setFilteredEstimations] = useState<Estimation[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [monthlyCommercialStats, setMonthlyCommercialStats] = useState<MonthlyCommercialStats>({});
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setIsAuthenticated(false);
      setPinError(false);
      
      const end = new Date();
      const start = new Date();
      start.setFullYear(end.getFullYear() - 1);
      
      setStartDate(start);
      setEndDate(end);
      filterEstimations(start, end);
    }
  }, [isOpen, estimations]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPin = e.target.value;
    setPin(newPin);
    setPinError(false);

    if (newPin.length === 4) {
      if (newPin === STATS_PIN) {
        setIsAuthenticated(true);
      } else {
        setPinError(true);
        setPin('');
      }
    }
  };

  const handlePinChangeSubmit = () => {
    const mainPin = localStorage.getItem('mainPin') || '7740';
    if (currentPin !== mainPin) {
      setPinChangeError('Code PIN actuel incorrect');
      return;
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinChangeError('Le nouveau code PIN doit contenir 4 chiffres');
      return;
    }

    if (newPin !== confirmPin) {
      setPinChangeError('Les codes PIN ne correspondent pas');
      return;
    }

    localStorage.setItem('mainPin', newPin);
    setShowPinChangeModal(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinChangeError('');
  };

  const filterEstimations = (start: Date, end: Date) => {
    const filtered = estimations.filter(estimation => {
      const date = new Date(estimation.estimationDate);
      return date >= start && date <= end;
    });

    setFilteredEstimations(filtered);
    calculateMonthlyCommercialStats(filtered);
  };

  const calculateMonthlyCommercialStats = (estimates: Estimation[]) => {
    const stats: MonthlyCommercialStats = {};
    
    estimates.forEach(estimation => {
      const date = new Date(estimation.estimationDate);
      const monthYear = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      
      if (!stats[monthYear]) {
        stats[monthYear] = {};
      }
      
      const commercial = estimation.commercial || 'Non assigné';
      stats[monthYear][commercial] = (stats[monthYear][commercial] || 0) + 1;
    });
    
    setMonthlyCommercialStats(stats);
  };

  const getCommercialStats = (): CommercialStats => {
    return filteredEstimations.reduce((acc: CommercialStats, curr) => {
      const commercial = curr.commercial || 'Non assigné';
      acc[commercial] = (acc[commercial] || 0) + 1;
      return acc;
    }, {});
  };

  const getMonthlyStats = () => {
    const monthlyData: { [key: string]: number } = {};
    const months: string[] = [];
    const counts: number[] = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthYear = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      monthlyData[monthYear] = 0;
      months.push(monthYear);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    filteredEstimations.forEach(estimation => {
      const date = new Date(estimation.estimationDate);
      const monthYear = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      if (monthYear in monthlyData) {
        monthlyData[monthYear]++;
      }
    });

    months.forEach(month => {
      counts.push(monthlyData[month]);
    });

    return {
      labels: months,
      data: counts
    };
  };

  const monthlyStats = getMonthlyStats();
  const commercialStats = getCommercialStats();

  const chartData: ChartData<'bar'> = {
    labels: monthlyStats.labels,
    datasets: [
      {
        label: 'Nombre d\'estimations',
        data: monthlyStats.data,
        backgroundColor: 'rgba(11, 128, 67, 0.6)',
        borderColor: 'rgb(11, 128, 67)',
        borderWidth: 1
      }
    ]
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })} - ${end.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}`;
  };

  const handleDateChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    filterEstimations(newStart, newEnd);
    setShowDatePicker(false);
  };

  const DateRangePicker = () => (
    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => handleDateChange(new Date(e.target.value), endDate)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0b8043] focus:border-[#0b8043]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
          <input
            type="date"
            value={endDate.toISOString().split('T')[0]}
            onChange={(e) => handleDateChange(startDate, new Date(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0b8043] focus:border-[#0b8043]"
          />
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-[#0b8043] p-4 rounded-full inline-block mb-4">
              <BarChart2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-2">Veuillez saisir le code PIN</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              placeholder="Code PIN"
              autoFocus
              className={`w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:ring-2 focus:ring-[#0b8043] focus:border-[#0b8043] ${
                pinError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {pinError && (
              <p className="text-red-500 text-sm text-center">Code PIN incorrect</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-y-auto z-50">
      <div className="min-h-screen">
        <header className="bg-[#0b8043] text-white shadow-lg sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChart2 className="h-8 w-8" />
                <h1 className="text-2xl font-bold">Tableau de bord</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPinChangeModal(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Changer le code PIN principal"
                >
                  <Lock className="h-6 w-6" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {showPinChangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Changer le code PIN principal</h2>
                <button
                  onClick={() => {
                    setShowPinChangeModal(false);
                    setCurrentPin('');
                    setNewPin('');
                    setConfirmPin('');
                    setPinChangeError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code PIN actuel
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b8043] focus:border-[#0b8043]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau code PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b8043] focus:border-[#0b8043]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau code PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b8043] focus:border-[#0b8043]"
                  />
                </div>

                {pinChangeError && (
                  <p className="text-red-500 text-sm">{pinChangeError}</p>
                )}

                <button
                  onClick={handlePinChangeSubmit}
                  className="w-full px-4 py-3 bg-[#0b8043] text-white rounded-lg hover:bg-[#096a36] transition-colors"
                >
                  Changer le code PIN
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-[#0b8043]" />
                <h2 className="text-lg font-semibold">Période</h2>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>{formatDateRange(startDate, endDate)}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showDatePicker && <DateRangePicker />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Total des estimations</h3>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {filteredEstimations.length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Par commercial</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(commercialStats).map(([commercial, count]) => (
                  <div key={commercial} className="flex items-center justify-between">
                    <span className="text-gray-600">{commercial}</span>
                    <span className="font-semibold text-purple-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:col-span-3">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <BarChart2 className="h-5 w-5 text-[#0b8043]" />
                </div>
                <h3 className="font-semibold text-gray-900">Évolution mensuelle</h3>
              </div>
              <div className="h-[400px]">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          title: (tooltipItems) => {
                            const monthYear = tooltipItems[0].label;
                            return `${monthYear}`;
                          },
                          afterTitle: (tooltipItems) => {
                            const monthYear = tooltipItems[0].label;
                            const stats = monthlyCommercialStats[monthYear];
                            if (!stats) return '';
                            
                            return Object.entries(stats)
                              .map(([commercial, count]) => `${commercial}: ${count}`)
                              .join('\n');
                          },
                          label: (tooltipItem) => {
                            return `Nombre d'estimations: ${tooltipItem.formattedValue}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}