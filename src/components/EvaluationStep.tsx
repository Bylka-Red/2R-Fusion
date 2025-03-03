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
  const addFeature = (type: 'strength' | 'weakness') => {
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Points forts */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Points forts</h3>
              <button
                type="button"
                onClick={() => addFeature('strength')}
                className="text-sm text-primary hover:text-primary-dark flex items-center transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Points faibles</h3>
              <button
                type="button"
                onClick={() => addFeature('weakness')}
                className="text-sm text-primary hover:text-primary-dark flex items-center transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
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

        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Estimation du prix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <label className="block">
              <span className="text-gray-700">Fourchette basse</span>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={estimatedPrice.low ? estimatedPrice.low.toLocaleString('fr-FR') : '0'}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
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
                  value={estimatedPrice.high ? estimatedPrice.high.toLocaleString('fr-FR') : '0'}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
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