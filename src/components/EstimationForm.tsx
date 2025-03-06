import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ArrowLeft, Euro, Camera, Calendar, Home, Building2, User, MapPin, Copy, Trash2, Phone, Mail, Plus, FileText, Download } from 'lucide-react';
import type { Estimation, PropertyFeature, Comparable, ComparablePhoto, PropertyCriteria, DiagnosticInfo, Owner, Commercial } from '../types';
import { AddressAutocomplete } from './AddressAutocomplete';
import { DiagnosticsStep } from './DiagnosticsStep';
import { EvaluationStep } from './EvaluationStep';
import EstimationStep1 from './EstimationStep1';
import EstimationStep2 from './EstimationStep2';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { EstimationReport } from './EstimationReport';
import { generateEstimationWord } from './EstimationWord';
import { generateEstimationFromTemplate } from './EstimationTemplateGenerator';
import { EstimationTabs } from './EstimationTabs';

interface EstimationFormProps {
  estimation?: Estimation | null;
  onSave: (estimation: Estimation) => void;
  onCancel: () => void;
  commercials: Commercial[];
}

export function EstimationForm({ estimation, onSave, onCancel, commercials }: EstimationFormProps) {
  const uniqueId = useRef(crypto.randomUUID()).current;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Estimation>(estimation || {
    id: uniqueId,
    createdAt: new Date().toISOString(),
    status: 'draft',
    visitDate: new Date().toISOString().split('T')[0],
    commercial: commercials[0]?.firstName || '',
    owners: [{
      firstName: '',
      lastName: '',
      address: '',
      phones: [''],
      emails: ['']
    }],
    propertyAddress: {
      fullAddress: ''
    },
    propertyType: 'apartment',
    isInCopropriete: false,
    surface: 0,
    rooms: 0,
    bedrooms: 0,
    condition: 'good',
    criteria: {
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
    diagnosticInfo: {
      propertyType: 'copropriete',
      hasCityGas: false
    },
    features: [],
    comparables: [],
    comparablePhotos: [],
    forSalePhotos: [],
    planPhotos: [],
    marketAnalysis: {
      averagePrice: 0,
      priceRange: {
        min: 0,
        max: 0,
      },
      marketTrend: 'stable',
      averageSaleTime: 0,
    },
    estimatedPrice: {
      low: 0,
      high: 0,
    },
    pricePerSqm: 0,
    photos: [],
    estimationDate: '01/01/1900', // Ajoutez cette ligne
  });

  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfKey, setPdfKey] = useState(0);

  useEffect(() => {
    if (currentStep === 5) {
      const timer = setTimeout(() => {
        setPdfKey(prev => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEstimationDateChange = (newDate: string) => {
    handleChange('estimationDate', newDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFormData = { ...formData, status: 'completed' as const };
    onSave(updatedFormData);
  };

  const copyFirstSellerAddress = () => {
    if (formData.owners[0]?.address) {
      handleChange('propertyAddress', { fullAddress: formData.owners[0].address });
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

  const renderPDFDownloadLink = () => {
    try {
      return (
        <PDFDownloadLink
          key={pdfKey}
          document={<EstimationReport estimation={formData} />}
          fileName={`estimation-${formData.id}.pdf`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
          onError={(error) => {
            console.error('PDF generation error:', error);
            setPdfError('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
          }}
        >
          {({ loading, error }) => (
            <>
              <FileText className="h-5 w-5 mr-2" />
              {loading ? 'Génération...' : error ? 'Erreur' : 'Générer l\'estimation'}
            </>
          )}
        </PDFDownloadLink>
      );
    } catch (error) {
      console.error('PDF render error:', error);
      return (
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <FileText className="h-5 w-5 mr-2" />
          Réessayer
        </button>
      );
    }
  };

  const tabs = [
    { id: 1, name: 'Propriétaires' },
    { id: 2, name: 'Bien' },
    { id: 3, name: 'Évaluation' },
    { id: 4, name: 'Diagnostics' },
    { id: 5, name: 'Générer' },
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
            onEstimationDateChange={handleEstimationDateChange} // Passez la fonction ici
          />
        );

      case 2:
        return (
          <EstimationStep2
            formData={formData}
            handleChange={handleChange}
            copyFirstSellerAddress={copyFirstSellerAddress}
            onNext={() => setCurrentStep(3)}
          />
        );

      case 3:
        return (
          <EvaluationStep
            features={formData.features}
            onFeaturesChange={(features) => handleChange('features', features)}
            estimatedPrice={formData.estimatedPrice}
            onEstimatedPriceChange={(price) => handleChange('estimatedPrice', price)}
            onNext={() => setCurrentStep(4)}
            onPrevious={() => setCurrentStep(2)}
            onCancel={onCancel}
          />
        );

      case 4:
        return (
          <DiagnosticsStep
            propertyType={formData.propertyType}
            constructionYear={formData.criteria.constructionYear}
            hasGas={formData.criteria.hasGas}
            onNext={() => setCurrentStep(5)}
            onPrevious={() => setCurrentStep(3)}
            onCancel={onCancel}
            isInCopropriete={formData.isInCopropriete}
          />
        );

      case 5:
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
        <EstimationTabs
          tabs={tabs}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />

        <div className="mb-8">
          {renderStepContent()}
        </div>

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
            {currentStep === 5 ? (
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
