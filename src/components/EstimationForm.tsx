import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ArrowDown, Download, FileText, Users, LayoutGrid, Home, ClipboardList, Activity, Save, Sliders } from 'lucide-react';
import type { Estimation, PropertyFeature, Comparable, ComparablePhoto, PropertyCriteria, DiagnosticInfo, Owner, Commercial } from '../types';
import { DiagnosticsStep } from './DiagnosticsStep';
import { EvaluationStep } from './EvaluationStep';
import EstimationStep1 from './EstimationStep1';
import EstimationStep2 from './EstimationStep2';
import { RoomAreaInput } from './RoomAreaInput';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { EstimationReport } from './EstimationReport';
import { generateEstimationWord } from './EstimationWord';
import { generateEstimationFromTemplate } from './EstimationTemplateGenerator';
import { EstimationTabs } from './EstimationTabs';
import { saveEstimation, getEstimation } from '../services/estimationService';
import { FloatingNotes } from './FloatingNotes';

interface EstimationFormProps {
  estimation?: Estimation | null;
  onSave: (estimation: Estimation) => void;
  onCancel: () => void;
  commercials: Commercial[];
}

export function EstimationForm({ estimation, onSave, onCancel, commercials }: EstimationFormProps) {
  const uniqueId = useRef(crypto.randomUUID()).current;
  const [currentStep, setCurrentStep] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(estimation?.notes || '');
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfKey, setPdfKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState<Estimation>({
    ...estimation,
    id: estimation?.id || uniqueId,
    createdAt: estimation?.createdAt || new Date().toISOString(),
    status: estimation?.status || 'draft',
    visitDate: estimation?.visitDate || new Date().toISOString().split('T')[0],
    commercial: estimation?.commercial || commercials[0]?.firstName || '',
    notes: estimation?.notes || '',
    owners: estimation?.owners || [{
      firstName: '',
      lastName: '',
      address: '',
      phones: [''],
      emails: ['']
    }],
    propertyAddress: estimation?.propertyAddress || {
      fullAddress: ''
    },
    propertyType: estimation?.propertyType || 'apartment',
    isInCopropriete: estimation?.isInCopropriete || false,
    surface: estimation?.surface || 0,
    rooms: estimation?.rooms || 0,
    bedrooms: estimation?.bedrooms || 0,
    condition: estimation?.condition || 'good',
    criteria: estimation?.criteria || {
      hasElevator: false,
      floorNumber: 0,
      totalFloors: 0,
      heatingType: 'individual',
      heatingEnergy: 'gas',
      hasAirConditioning: false,
      hasCellar: false,
      hasParking: false,
      hasBalcony: false,
      hasTerrace: false,
      hasGarden: false,
      exposure: 'south',
      windowsType: 'single',
      constructionMaterial: 'concrete',
      livingRoomSurface: 0,
      bathrooms: 0,
      showerRooms: 0,
      kitchenType: 'open-equipped',
      heatingSystem: 'individual-gas',
      adjacency: 'both-sides',
      basement: 'none',
      landSurface: 0,
      propertyTax: 0,
      hasGas: false,
      hasGarage: false,
      hasFireplace: false,
      hasWoodStove: false,
      hasElectricShutters: false,
      hasElectricGate: false,
      hasConvertibleAttic: false,
    },
    diagnosticInfo: estimation?.diagnosticInfo || {
      propertyType: 'copropriete',
      hasCityGas: false
    },
    features: estimation?.features || [],
    comparables: estimation?.comparables || [],
    comparablePhotos: estimation?.comparablePhotos || [],
    forSalePhotos: estimation?.forSalePhotos || [],
    planPhotos: estimation?.planPhotos || [],
    marketAnalysis: estimation?.marketAnalysis || {
      averagePrice: 0,
      priceRange: {
        min: 0,
        max: 0,
      },
      marketTrend: 'stable',
      averageSaleTime: 0,
    },
    estimatedPrice: estimation?.estimatedPrice || {
      low: 0,
      high: 0,
    },
    pricePerSqm: estimation?.pricePerSqm || 0,
    photos: estimation?.photos || [],
    estimationDate: estimation?.estimationDate || new Date().toISOString().split('T')[0],
    levels: estimation?.levels || [{
      name: 'Rez-de-chaussée',
      rooms: [],
      type: 'regular'
    }]
  });

  useEffect(() => {
    if (estimation) {
      setNotes(estimation.notes || '');
      setFormData(prev => ({
        ...prev,
        notes: estimation.notes || ''
      }));
    }
  }, [estimation]);

  useEffect(() => {
    const fetchEstimationData = async () => {
      if (estimation?.id) {
        const fetchedEstimation = await getEstimation(estimation.id);
        if (fetchedEstimation) {
          setFormData(fetchedEstimation);
        }
      }
    };

    fetchEstimationData();
  }, [estimation?.id]);

  useEffect(() => {
    if (currentStep === 5) {
      const timer = setTimeout(() => {
        setPdfKey(prev => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleChange = (field: string, value: any) => {
    if (field === 'notes') {
      setNotes(value);
      setFormData(prev => ({
        ...prev,
        notes: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleQuickSave = async () => {
  try {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    const updatedFormData = {
      ...formData,
      status: 'completed' as const,
      notes: notes
    };
    await saveEstimation(updatedFormData);
    onSave(updatedFormData);
    setSaveSuccess(true);
  } catch (error) {
    console.error('Error saving estimation:', error);
    setError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement");
  } finally {
    setIsSaving(false);
  }
};


  const handleEstimationDateChange = (newDate: string) => {
    handleChange('estimationDate', newDate);
  };

  const handleLivingAreaChange = (area: number) => {
    handleChange('surface', area);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêcher la soumission par défaut du formulaire
    
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);

      const updatedFormData = {
        ...formData,
        status: 'completed' as const,
        notes: notes
      };
      await saveEstimation(updatedFormData);
      onSave(updatedFormData); // Cette fonction devrait maintenant rediriger vers la liste des estimations
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving estimation:', error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWordExport = async () => {
    try {
      await generateEstimationFromTemplate(formData);
    } catch (error) {
      console.error('Error generating Word document:', error);
      setPdfError('Une erreur est survenue lors de la génération du document Word. Veuillez réessayer.');
    }
  };

  const handleSaveWithoutEvent = async () => {
  try {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    const updatedFormData = {
      ...formData,
      status: 'completed' as const,
      notes: notes
    };
    await saveEstimation(updatedFormData);
    onSave(updatedFormData);
    setSaveSuccess(true);
  } catch (error) {
    console.error('Error saving estimation:', error);
    setError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement");
  } finally {
    setIsSaving(false);
  }
};



  const tabs = [
    { id: 1, name: 'Propriétaires', icon: Users },
    { id: 2, name: 'Pièces', icon: LayoutGrid },
    { id: 3, name: 'Critères', icon: Sliders },
    { id: 4, name: 'Évaluation', icon: ClipboardList },
    { id: 5, name: 'Diagnostics', icon: Activity },
    { id: 6, name: 'Générer', icon: Save },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <EstimationStep1
            owners={formData.owners}
            onOwnersChange={(owners) => handleChange('owners', owners)}
            propertyAddress={formData.propertyAddress}
            onPropertyAddressChange={(address) => handleChange('propertyAddress', address)}
            propertyType={formData.propertyType}
            onPropertyTypeChange={(type) => handleChange('propertyType', type)}
            isInCopropriete={formData.isInCopropriete}
            onIsInCoproprieteChange={(value) => handleChange('isInCopropriete', value)}
            onNext={() => setCurrentStep(2)}
            commercial={formData.commercial}
            onCommercialChange={(commercial) => handleChange('commercial', commercial)}
            commercials={commercials}
            estimationDate={formData.estimationDate}
            onEstimationDateChange={handleEstimationDateChange}
          />
        );

      case 2:
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Surfaces des pièces</h2>
            <RoomAreaInput
              levels={formData.levels || []}
              onChange={(levels) => handleChange('levels', levels)}
              onLivingAreaChange={handleLivingAreaChange}
            />
          </div>
        );

      case 3:
        return (
          <EstimationStep2
            formData={formData}
            handleChange={handleChange}
            onNext={() => setCurrentStep(4)}
          />
        );

      case 4:
        return (
          <EvaluationStep
            features={formData.features}
            onFeaturesChange={(features) => handleChange('features', features)}
            estimatedPrice={formData.estimatedPrice}
            onEstimatedPriceChange={(price) => handleChange('estimatedPrice', price)}
            onNext={() => setCurrentStep(5)}
            onPrevious={() => setCurrentStep(3)}
            onCancel={onCancel}
          />
        );

      case 5:
        return (
          <DiagnosticsStep
            propertyType={formData.propertyType}
            constructionYear={formData.criteria.constructionYear}
            hasGas={formData.criteria.hasGas}
            onNext={() => setCurrentStep(6)}
            onPrevious={() => setCurrentStep(4)}
            onCancel={onCancel}
            isInCopropriete={formData.isInCopropriete}
          />
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Générer l'estimation</h3>
            <p className="text-gray-600">
              Votre estimation est prête à être enregistrée. Vous pouvez maintenant générer le rapport d'estimation ou enregistrer les informations.
            </p>
            {pdfError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {pdfError}
                <button
                  onClick={() => setPdfError(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-colors transform scale-80 ${
              showNotes
                ? 'bg-[#0b8043] text-white'
                : 'text-[#0b8043] border border-[#0b8043] hover:bg-green-50'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </button>
        </div>

        <div className="mb-6">
          <EstimationTabs
            tabs={tabs}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            estimation={formData}
            onSave={handleSubmit}
            isSaving={isSaving}
            handleSaveWithoutEvent={handleSaveWithoutEvent}
          />
        </div>

        <div className="mb-8">
          {renderStepContent()}
        </div>

        {showNotes && (
          <FloatingNotes
            key={`notes-${formData.id}`}
            isOpen={showNotes}
            onClose={() => setShowNotes(false)}
            notes={notes}
            onNotesChange={(newNotes) => handleChange('notes', newNotes)}
          />
        )}

        <div className="flex justify-between">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(step => step - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Précédent
            </button>
          )}
          <div className="ml-auto flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Annuler
            </button>
            {currentStep === 6 ? (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleWordExport}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Générer l'estimation
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0b8043] hover:bg-[#097339] rounded-md"
                >
                  Enregistrer
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep(step => step + 1)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0b8043] hover:bg-[#097339] rounded-md"
              >
                Suivant
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}