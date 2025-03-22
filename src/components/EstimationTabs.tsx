import React from 'react';
import { Save } from 'lucide-react';
import { saveEstimation } from '../services/estimationService';
import type { Estimation } from '../types';

interface Tab {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
}

interface EstimationTabsProps {
  tabs: Tab[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  estimation: Estimation;
  onSave: () => void;
  isSaving: boolean;
  handleSaveWithoutEvent: () => void; // Ajout de la prop pour la sauvegarde rapide
}

export function EstimationTabs({
  tabs,
  currentStep,
  setCurrentStep,
  estimation,
  onSave,
  isSaving,
  handleSaveWithoutEvent
}: EstimationTabsProps) {

  // Gestion du clic sur un onglet avec sauvegarde automatique
  const handleTabClick = async (e: React.MouseEvent<HTMLButtonElement>, tabId: number) => {
    e.preventDefault();

    try {
      // Sauvegarde automatique avant de changer d'onglet
      await saveEstimation(estimation);
      setCurrentStep(tabId);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
      // Changement d'onglet même si la sauvegarde échoue
      setCurrentStep(tabId);
    }
  };

  // Fonction de sauvegarde rapide
  const handleQuickSave = async () => {
    await handleSaveWithoutEvent(); // Utilisation de la fonction passée en prop
  };

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="flex justify-center -mb-px space-x-2 overflow-x-auto pb-1 relative" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={(e) => handleTabClick(e, tab.id)}
              className={`
                flex items-center space-x-2 whitespace-nowrap py-2 px-3 text-sm font-medium rounded-t-lg transition-colors duration-200
                ${currentStep === tab.id
                  ? 'border-b-2 border-primary text-primary bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-current={currentStep === tab.id ? 'page' : undefined}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}

          {/* Bouton de sauvegarde rapide */}
          <button
            type="button"
            onClick={handleQuickSave}
            disabled={isSaving}
            className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary-dark hover:bg-green-50 rounded-lg transition-colors ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Enregistrer les modifications"
          >
            <Save className={`h-5 w-5 ${isSaving ? 'animate-spin' : ''}`} />
          </button>
        </nav>
      </div>
    </div>
  );
}
