import React from 'react';
import { Plus, Trash2, Euro } from 'lucide-react';
import type { PropertyFeature } from '../types';

interface EvaluationStepProps {
  features: PropertyFeature[];
  onFeaturesChange: (features: PropertyFeature[]) => void;
  estimatedPrice: {
    low: number;
    high: number;
    recommended?: number;
  };
  onEstimatedPriceChange: (price: { low: number; high: number; recommended?: number }) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
}

export function EvaluationStep({
  features,
  onFeaturesChange,
  estimatedPrice,
  onEstimatedPriceChange,
  onNext,
  onPrevious,
  onCancel,
}: EvaluationStepProps) {
  const addFeature = (type: 'strength' | 'weakness' | 'soldPrice' | 'forSalePrice' | 'saleDate') => {
    onFeaturesChange([...features, { type, description: '' }]);
  };

  const removeFeature = (index: number) => {
    onFeaturesChange(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, description: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], description };
    onFeaturesChange(newFeatures);
  };

  const strengths = features.filter(f => f.type === 'strength');
  const weaknesses = features.filter(f => f.type === 'weakness');
  const soldPrices = features.filter(f => f.type === 'soldPrice');
  const forSalePrices = features.filter(f => f.type === 'forSalePrice');
  const saleDates = features.filter(f => f.type === 'saleDate');

  const calculateAverage = (prices: string[]) => {
    const numericPrices = prices.map(price => parseInt(price.replace(/[^0-9]/g, '')) || 0);
    const sum = numericPrices.reduce((acc, curr) => acc + curr, 0);
    return numericPrices.length ? Math.floor(sum / numericPrices.length) : 0;
  };

  const soldPricesTotal = calculateAverage(soldPrices.map(f => f.description));
  const forSalePricesTotal = calculateAverage(forSalePrices.map(f => f.description));

  const calculateDaysSince = (dateString: string) => {
    const dateParts = dateString.split('/');
    if (dateParts.length !== 3) return '';
    const [day, month, year] = dateParts.map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();

    let diffYears = today.getFullYear() - date.getFullYear();
    let diffMonths = today.getMonth() - date.getMonth();
    let diffDays = today.getDate() - date.getDate();

    // Ajustement pour les années et les mois
    if (diffDays < 0) {
      diffMonths -= 1;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      diffDays += lastMonth.getDate();
    }
    if (diffMonths < 0) {
      diffYears -= 1;
      diffMonths += 12;
    }

    // Construction du résultat
    let result = [];
    if (diffYears > 0) result.push(`${diffYears} an${diffYears > 1 ? 's' : ''}`);
    if (diffMonths > 0) result.push(`${diffMonths} mois`);
    if (diffDays > 0 || result.length === 0) result.push(`${diffDays} jour${diffDays > 1 ? 's' : ''}`);

    return result.join(' et ');
  };

  const formatDate = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length > 8) return value;

    if (cleanValue.length > 0) {
      if (cleanValue.length <= 2) {
        return `${cleanValue}/`;
      } else if (cleanValue.length <= 4) {
        return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/`;
      } else {
        return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4, 8)}`;
      }
    }
    return cleanValue;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Points forts */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Points forts</h3>
              <button
                type="button"
                onClick={() => addFeature('strength')}
                className="text-sm text-primary hover:text-primary-dark flex items-center transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
              </button>
            </div>
            <div className="space-y-3">
              {strengths.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(
                      features.indexOf(feature),
                      e.target.value
                    )}
                    placeholder="Ex: Lumineux et traversant"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(features.indexOf(feature))}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {strengths.length === 0 && (
                <p className="text-sm text-gray-500 italic">Aucun point fort ajouté</p>
              )}
            </div>
          </div>

          {/* Points faibles */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Points faibles</h3>
              <button
                type="button"
                onClick={() => addFeature('weakness')}
                className="text-sm text-primary hover:text-primary-dark flex items-center transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
              </button>
            </div>
            <div className="space-y-3">
              {weaknesses.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(
                      features.indexOf(feature),
                      e.target.value
                    )}
                    placeholder="Ex: Travaux à prévoir"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(features.indexOf(feature))}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {weaknesses.length === 0 && (
                <p className="text-sm text-gray-500 italic">Aucun point faible ajouté</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Prix au m² Vendus */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Prix au m² "Vendus"</h3>
              <button
                type="button"
                onClick={() => addFeature('soldPrice')}
                className="text-sm text-primary hover:text-primary-dark flex items-center transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
              </button>
            </div>
            <div className="space-y-3">
              {soldPrices.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(
                      features.indexOf(feature),
                      e.target.value
                    )}
                    placeholder="Ex: 3000 €/m²"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(features.indexOf(feature))}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {soldPrices.length === 0 && (
                <p className="text-sm text-gray-500 italic">Aucun prix au m² vendu ajouté</p>
              )}
              {soldPrices.length > 0 && (
                <p className="text-sm text-gray-700 font-bold text-[#0b8043]">
                  Total: {soldPricesTotal.toLocaleString('fr-FR')} €/m²
                </p>
              )}
            </div>
          </div>

          {/* Prix au m² A VENDRE */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Prix au m² "A Vendre"</h3>
              <button
                type="button"
                onClick={() => addFeature('forSalePrice')}
                className="text-sm text-primary hover:text-primary-dark flex items-center transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
              </button>
            </div>
            <div className="space-y-3">
              {forSalePrices.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(
                      features.indexOf(feature),
                      e.target.value
                    )}
                    placeholder="Ex: 3200 €/m²"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(features.indexOf(feature))}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {forSalePrices.length === 0 && (
                <p className="text-sm text-gray-500 italic">Aucun prix au m² à vendre ajouté</p>
              )}
              {forSalePrices.length > 0 && (
                <p className="text-sm text-gray-700 font-bold text-[#0b8043]">
                  Total: {forSalePricesTotal.toLocaleString('fr-FR')} €/m²
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200"></div>

        {/* Solution modifiée ici: utilisation d'une grille 2 colonnes pour la section complète */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">En vente depuis...</h3>
            <button
              type="button"
              onClick={() => addFeature('saleDate')}
              className="text-sm text-primary hover:text-primary-dark flex items-center transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {saleDates.map((feature, index) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-sm mr-2">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={feature.description}
                  onChange={(e) => {
                    const formattedDate = formatDate(e.target.value);
                    updateFeature(features.indexOf(feature), formattedDate);
                  }}
                  placeholder="Ex: 07032025"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(features.indexOf(feature))}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700 font-bold text-[#0b8043]">
                  {calculateDaysSince(feature.description)}
                </span>
              </div>
            ))}
            {saleDates.length === 0 && (
              <p className="text-sm text-gray-500 italic">Aucune date de vente ajoutée</p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Estimation du prix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <label className="block">
              <span className="text-gray-700">Fourchette basse</span>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={estimatedPrice.low ? estimatedPrice.low.toLocaleString('fr-FR') : ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || '';
                    onEstimatedPriceChange({
                      ...estimatedPrice,
                      low: value,
                    });
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm pr-10 transition-colors duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-gray-700">Fourchette haute</span>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={estimatedPrice.high ? estimatedPrice.high.toLocaleString('fr-FR') : ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || '';
                    onEstimatedPriceChange({
                      ...estimatedPrice,
                      high: value,
                      recommended: undefined
                    });
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm pr-10 transition-colors duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}