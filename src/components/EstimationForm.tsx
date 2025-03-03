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

const sampleEstimation: Estimation = {
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  status: 'draft',
  visitDate: '2024-03-15',
  commercial: 'Redhouane',
  owners: [{
    firstName: 'Jean',
    lastName: 'DUPONT',
    address: '12 rue des Lilas, 77400 Lagny-sur-Marne',
    phones: ['06 12 34 56 78'],
    emails: ['jean.dupont@email.com']
  }],
  propertyAddress: { 
    fullAddress: '12 rue des Lilas, 77400 Lagny-sur-Marne' 
  },
  propertyType: 'apartment',
  isInCopropriete: false,
  surface: 85,
  rooms: 4,
  bedrooms: 2,
  constructionYear: 1985,
  energyClass: 'D',
  condition: 'good',
  criteria: {
    hasElevator: true,
    floorNumber: 3,
    totalFloors: 4,
    heatingType: 'individual',
    heatingEnergy: 'gas',
    hasAirConditioning: false,
    hasCellar: true,
    hasParking: true,
    hasBalcony: true,
    hasTerrace: false,
    hasGarden: false,
    exposure: 'south',
    windowsType: 'double',
    constructionMaterial: 'concrete',
    livingRoomSurface: 28,
    bathrooms: 1,
    showerRooms: 0,
    kitchenType: 'open-equipped',
    heatingSystem: 'individual-gas',
    adjacency: 'both-sides',
    basement: 'none',
    landSurface: 0,
    constructionYear: 1985,
    propertyTax: 1200,
    hasGas: true,
    hasGarage: true,
    hasFireplace: false,
    hasWoodStove: false,
    hasElectricShutters: true,
    hasElectricGate: true,
    hasConvertibleAttic: false,
  },
  diagnosticInfo: {
    propertyType: 'copropriete',
    hasCityGas: true
  },
  features: [
    { type: 'strength', description: 'Lumineux et traversant' },
    { type: 'strength', description: 'Proche des commerces et écoles' },
    { type: 'strength', description: 'Balcon exposé sud' },
    { type: 'strength', description: 'Cave et parking inclus' },
    { type: 'strength', description: 'Double vitrage récent' },
    { type: 'weakness', description: 'Cuisine à rafraîchir' },
    { type: 'weakness', description: 'Salle de bain d\'origine' },
    { type: 'weakness', description: 'Pas d\'ascenseur (3ème étage)' },
  ],
  comparables: [
    {
      address: '8 rue des Roses, 77400 Lagny-sur-Marne',
      price: 295000,
      surface: 82,
      rooms: 4,
      saleDate: '2024-02-01',
    },
    {
      address: '15 rue du Commerce, 77400 Lagny-sur-Marne',
      price: 305000,
      surface: 88,
      rooms: 4,
      saleDate: '2024-01-15',
    },
  ],
  comparablePhotos: [],
  forSalePhotos: [],
  planPhotos: [],
  marketAnalysis: {
    averagePrice: 300000,
    priceRange: {
      min: 285000,
      max: 315000,
    },
    marketTrend: 'stable',
    averageSaleTime: 90,
  },
  estimatedPrice: {
    low: 290000,
    high: 305000,
    recommended: 298000,
  },
  pricePerSqm: 3505,
  comments: 'Bel appartement familial dans une résidence calme et bien entretenue. Idéalement situé à proximité des commerces, écoles et transports. Quelques travaux de rafraîchissement à prévoir dans la cuisine et la salle de bain.',
  photos: [],
};

export function EstimationForm({ estimation, onSave, onCancel, commercials }: EstimationFormProps) {
  // Generate a unique ID for each new estimation
  const uniqueId = useRef(crypto.randomUUID()).current;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Estimation>(estimation || {
    ...sampleEstimation,
    id: uniqueId, // Use the unique ID generated for this form instance
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
      // Utiliser la nouvelle fonction basée sur le modèle Word
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