import React, { useState } from 'react';
import { ChevronRight, Plus, Settings } from 'lucide-react';
import { SellersTab } from './components/SellersTab';
import { PropertyTab } from './components/PropertyTab';
import { MandateTab } from './components/MandateTab';
import { EstimationsTab } from './components/EstimationsTab';
import { MandatesList } from './components/MandatesList';
import { HomePage } from './components/HomePage';
import { SettingsTab } from './components/SettingsTab';
import { PurchaseOfferTab } from './components/PurchaseOfferTab';
import { CompromiseTab } from './components/CompromiseTab';
import type { Seller, PropertyLot, PropertyAddress, CadastralSection, Mandate, OccupationStatus, DPEStatus, Estimation, Commercial } from './types';

// Test data moved to separate const declarations for clarity
const testSeller: Seller = {
  type: 'individual',
  title: 'Mr',
  firstName: 'Jean',
  lastName: 'DUPONT',
  birthDate: '1975-05-15',
  birthPlace: 'Paris',
  birthPostalCode: '75012',
  nationality: 'Française',
  profession: 'Ingénieur',
  maritalStatus: 'communaute-acquets',
  marriageDetails: {
    date: '2005-06-12',
    place: 'Lagny-sur-Marne',
    regime: 'community',
  },
  address: {
    fullAddress: '12 rue des Lilas, 77400 Lagny-sur-Marne',
  },
  phone: '06 12 34 56 78',
  email: 'jean.dupont@email.com',
  hasFrenchTaxResidence: true,
};

const testLot: PropertyLot = {
  number: '45',
  description: 'Appartement T4 au 3ème étage',
  tantiemes: [{
    numerator: '150',
    denominator: '10000',
    type: 'general'
  }],
  carrezSurface: '85.20',
  carrezGuarantor: {
    type: 'diagnostician',
    name: 'DIAG EXPERT',
    date: '2024-03-10',
  },
};

const testCadastralSection: CadastralSection = {
  section: 'AB',
  number: '123',
  lieuDit: 'Les Lilas',
  surface: '8520',
};

const testEstimation: Estimation = {
  id: crypto.randomUUID(),
  createdAt: '2024-03-15T10:00:00.000Z',
  status: 'completed',
  visitDate: '2024-03-15',
  propertyAddress: {
    fullAddress: '12 rue des Lilas, 77400 Lagny-sur-Marne',
  },
  propertyType: 'apartment',
  isInCopropriete: true,
  surface: 85,
  rooms: 4,
  bedrooms: 2,
  constructionYear: 1985,
  energyClass: 'D',
  condition: 'good',
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
    recommended: 298000,
    high: 305000,
  },
  pricePerSqm: 3505,
  comments: 'Bel appartement familial dans une résidence calme et bien entretenue. Idéalement situé à proximité des commerces, écoles et transports. Quelques travaux de rafraîchissement à prévoir dans la cuisine et la salle de bain.',
  owners: [{
    firstName: 'Jean',
    lastName: 'DUPONT',
    address: '12 rue des Lilas, 77400 Lagny-sur-Marne',
    phones: ['06 12 34 56 78'],
    emails: ['jean.dupont@email.com']
  }],
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
  comparablePhotos: [],
  forSalePhotos: [],
  planPhotos: [],
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
      description: 'Salon lumineux',
    },
    {
      url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8',
      description: 'Cuisine équipée',
    },
  ],
};

const testMandate: Mandate = {
  date: '2024-03-20',
  type: 'exclusive',
  mandateNumber: '2024-001',
  netPrice: 298000,
  fees: {
    ttc: 12000,
    ht: 10000,
  },
  feesPayer: 'seller',
  commercial: 'Redhouane',
  keys: {
    hasKeys: true,
    receivedDate: '2024-03-20',
    details: '2 clés porte d\'entrée, 1 clé boîte aux lettres, 1 badge parking, 1 clé cave',
  },
  amendments: [],
};

const initialCommercials: Commercial[] = [
  {
    id: '1',
    firstName: 'Redhouane',
    lastName: 'KABACHE',
    phone: '06 12 34 56 78',
    email: 'redhouane@2r-immobilier.fr',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    facebook: 'https://facebook.com/redhouane.kabache',
    instagram: 'https://instagram.com/redhouane.kabache',
    whatsapp: '+33612345678'
  },
  {
    id: '2',
    firstName: 'Audrey',
    lastName: 'GABRIEL',
    phone: '0768881660',
    email: 'a.gabriel@2r-immobilier.fr',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
  },
  {
    id: '3',
    firstName: 'Christelle',
    lastName: 'MULLINGHAUSEN',
    phone: '0638226070',
    email: 'm.christelle@2r-immobilier.fr',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
  }
];

function App() {
  const [view, setView] = useState<'home' | 'estimations' | 'mandates' | 'settings'>('home');
  const [activeTab, setActiveTab] = useState('sellers');
  const [selectedMandate, setSelectedMandate] = useState<Mandate | null>(null);
  const [mandates, setMandates] = useState<Mandate[]>([testMandate]);
  const [estimations, setEstimations] = useState<Estimation[]>([testEstimation]);
  const [sellers, setSellers] = useState<Seller[]>([{ ...testSeller }]);
  const [propertyAddress, setPropertyAddress] = useState<PropertyAddress>({ fullAddress: '12 rue des Lilas, 77400 Lagny-sur-Marne' });
  const [propertyType, setPropertyType] = useState<'monopropriete' | 'copropriete'>('copropriete');
  const [propertyFamilyType, setPropertyFamilyType] = useState<'personal-not-family' | 'personal-family'>('personal-not-family');
  const [coPropertyAddress, setCoPropertyAddress] = useState<PropertyAddress>({ fullAddress: '12 rue des Lilas, 77400 Lagny-sur-Marne' });
  const [lots, setLots] = useState<PropertyLot[]>([{ ...testLot }]);
  const [officialDesignation, setOfficialDesignation] = useState('Appartement de type F4 situé au 3ème étage comprenant : entrée, séjour avec balcon, cuisine, trois chambres, salle de bain, WC séparés. Cave et parking en sous-sol.');
  const [cadastralSections, setCadastralSections] = useState<CadastralSection[]>([{ ...testCadastralSection }]);
  const [occupationStatus, setOccupationStatus] = useState<OccupationStatus>('occupied-by-seller');
  const [dpeStatus, setDpeStatus] = useState<DPEStatus>('completed');
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [commercials, setCommercials] = useState<Commercial[]>(initialCommercials);

  const createNewMandate = () => {
    const newMandate: Mandate = {
      date: new Date().toISOString().split('T')[0],
      type: 'exclusive',
      mandateNumber: `2024-${(mandates.length + 1).toString().padStart(3, '0')}`,
      netPrice: 0,
      fees: {
        ttc: 0,
        ht: 0,
      },
      feesPayer: 'seller',
      commercial: commercials[0].firstName,
      keys: {
        hasKeys: false,
        details: '',
      },
      amendments: [],
    };
    setMandates([...mandates, newMandate]);
    setSelectedMandate(newMandate);
    setActiveTab('sellers');

    setSellers([{ ...testSeller }]);
    setPropertyAddress({ fullAddress: '' });
    setPropertyType('copropriete');
    setPropertyFamilyType('personal-not-family');
    setCoPropertyAddress({ fullAddress: '' });
    setLots([{ ...testLot }]);
    setOfficialDesignation('');
    setCadastralSections([{ ...testCadastralSection }]);
    setOccupationStatus('occupied-by-seller');
    setDpeStatus('completed');
  };

  const updateSelectedMandate = (field: keyof Mandate | 'feesTTC' | 'keys', value: any) => {
    if (!selectedMandate) return;

    let updatedMandate = { ...selectedMandate };

    if (field === 'feesTTC') {
      const ttc = typeof value === 'string' ? parseInt(value) || 0 : value;
      const ht = Math.round(ttc / 1.2);
      updatedMandate.fees = { ttc, ht };
    } else if (field === 'netPrice') {
      updatedMandate[field] = typeof value === 'string' ? parseInt(value) || 0 : value;
    } else {
      updatedMandate[field as keyof Mandate] = value;
    }

    setSelectedMandate(updatedMandate);
    setMandates(mandates.map(m =>
      m.mandateNumber === selectedMandate.mandateNumber ? updatedMandate : m
    ));
  };

  const deleteMandate = (mandateNumber: string) => {
    setMandates(mandates.filter(m => m.mandateNumber !== mandateNumber));
    if (selectedMandate?.mandateNumber === mandateNumber) {
      setSelectedMandate(null);
    }
  };

  const handleMandateSelect = (mandate: Mandate) => {
    setSelectedMandate(mandate);
    setActiveTab('sellers');
  };

  const handleSellerChange = (index: number, updatedSeller: Seller) => {
    const newSellers = [...sellers];
    newSellers[index] = updatedSeller;
    setSellers(newSellers);
  };

  const addSeller = () => {
    setSellers([...sellers, { ...testSeller }]);
  };

  const removeSeller = (index: number) => {
    setSellers(sellers.filter((_, i) => i !== index));
  };

  const handlePropertyTypeChange = (type: 'personal-not-family' | 'personal-family') => {
    setPropertyFamilyType(type);
  };

  const copyFirstSellerAddress = () => {
    if (sellers.length > 0 && sellers[0].address) {
      setPropertyAddress({ ...sellers[0].address });
    }
  };

  const handleConvertEstimationToMandate = (estimation: Estimation) => {
    if (window.confirm('Êtes-vous sûr de vouloir convertir cette estimation en mandat de vente ?')) {
      const newMandate: Mandate = {
        date: new Date().toISOString().split('T')[0],
        type: 'exclusive',
        mandateNumber: `2024-${(mandates.length + 1).toString().padStart(3, '0')}`,
        netPrice: estimation.estimatedPrice.recommended || estimation.estimatedPrice.low,
        fees: {
          ttc: 12000,
          ht: 10000,
        },
        feesPayer: 'seller',
        commercial: estimation.commercial || commercials[0].firstName,
        keys: {
          hasKeys: false,
          details: '',
        },
        amendments: [],
      };

      setMandates([...mandates, newMandate]);
      setSelectedMandate(newMandate);
      setView('mandates');
      setActiveTab('sellers');

      // Update estimation status
      const updatedEstimation = { ...estimation, status: 'converted' as const };
      setEstimations(prevEstimations =>
        prevEstimations.map(est =>
          est.id === estimation.id ? updatedEstimation : est
        )
      );

      // Initialize mandate data with estimation information
      if (estimation.owners[0]) {
        const seller: Seller = {
          type: 'individual',
          title: 'Mr',
          firstName: estimation.owners[0].firstName,
          lastName: estimation.owners[0].lastName,
          phone: estimation.owners[0].phones[0],
          email: estimation.owners[0].emails[0],
          address: { fullAddress: estimation.owners[0].address },
          hasFrenchTaxResidence: true,
          marriageDetails: {
            date: '',
            place: '',
            regime: 'community',
          },
        };
        setSellers([seller]);
      }

      setPropertyAddress(estimation.propertyAddress);
      setPropertyType('copropriete');
      setPropertyFamilyType('personal-not-family');
    }
  };

  // Render the header consistently across all views
  const renderHeader = () => (
    <header className="bg-[#0b8043] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('home')}
              className="text-white hover:text-gray-200 transition-colors text-2xl font-bold"
            >
              2R FUSION
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setView('estimations');
                setActiveTab('estimations');
                setSelectedMandate(null);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'estimations'
                  ? 'bg-white text-[#0b8043]'
                  : 'text-white hover:bg-[#097339]'
              }`}
            >
              Estimations
            </button>
            <button
              onClick={() => {
                setView('mandates');
                setSelectedMandate(null);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'mandates'
                  ? 'bg-white text-[#0b8043]'
                  : 'text-white hover:bg-[#097339]'
              }`}
            >
              Mandats
            </button>
            <button
              onClick={() => {
                setView('settings');
                setSelectedMandate(null);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'settings'
                  ? 'bg-white text-[#0b8043]'
                  : 'text-white hover:bg-[#097339]'
              }`}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  if (view === 'home') {
    return (
      <HomePage
        onNavigate={(newView) => setView(newView)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'estimations' && (
          <EstimationsTab
            estimations={estimations}
            setEstimations={setEstimations}
            onConvertToMandate={handleConvertEstimationToMandate}
            commercials={commercials}
          />
        )}

        {view === 'settings' && (
          <SettingsTab
            commercials={commercials}
            onCommercialsChange={setCommercials}
          />
        )}

        {view === 'mandates' && !selectedMandate && (
          <MandatesList
            mandates={mandates}
            onMandateSelect={handleMandateSelect}
            onCreateMandate={createNewMandate}
            onDeleteMandate={deleteMandate}
          />
        )}

        {view === 'mandates' && selectedMandate && (
          <>
            <div className="mb-8 flex justify-between items-center">
              <nav className="flex space-x-4" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('sellers')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'sellers'
                      ? 'bg-[#0b8043] text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Infos Vendeurs
                </button>
                <button
                  onClick={() => setActiveTab('property')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'property'
                      ? 'bg-[#0b8043] text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Infos Bien
                </button>
                <button
                  onClick={() => setActiveTab('mandate')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'mandate'
                      ? 'bg-[#0b8043] text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Infos Mandat
                </button>
                <button
                  onClick={() => setActiveTab('purchase-offer')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'purchase-offer'
                      ? 'bg-[#0b8043] text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Offre d'achat
                </button>
                <button
                  onClick={() => setActiveTab('compromise')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'compromise'
                      ? 'bg-[#0b8043] text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Compromis
                </button>
              </nav>
              <button
                onClick={() => setSelectedMandate(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Retour à la liste
              </button>
            </div>

            {activeTab === 'sellers' && (
              <SellersTab
                sellers={sellers}
                onSellerChange={handleSellerChange}
                onAddSeller={addSeller}
                onRemoveSeller={removeSeller}
                onPropertyTypeChange={handlePropertyTypeChange}
                propertyFamilyType={propertyFamilyType}
              />
            )}

            {activeTab === 'property' && (
              <PropertyTab
                propertyAddress={propertyAddress}
                setPropertyAddress={setPropertyAddress}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                coPropertyAddress={coPropertyAddress}
                setCoPropertyAddress={setCoPropertyAddress}
                lots={lots}
                setLots={setLots}
                officialDesignation={officialDesignation}
                setOfficialDesignation={setOfficialDesignation}
                cadastralSections={cadastralSections}
                setCadastralSections={setCadastralSections}
                copyFirstSellerAddress={copyFirstSellerAddress}
                sellers={sellers}
                onPropertyTypeChange={handlePropertyTypeChange}
                propertyFamilyType={propertyFamilyType}
                occupationStatus={occupationStatus}
                setOccupationStatus={setOccupationStatus}
                dpeStatus={dpeStatus}
                setDpeStatus={setDpeStatus}
              />
            )}

            {activeTab === 'mandate' && (
              <MandateTab
                mandate={selectedMandate}
                onMandateChange={updateSelectedMandate}
                sellers={sellers}
                showAmendmentModal={showAmendmentModal}
                setShowAmendmentModal={setShowAmendmentModal}
                propertyAddress={propertyAddress}
                propertyType={propertyType}
                coPropertyAddress={coPropertyAddress}
                lots={lots}
                officialDesignation={officialDesignation}
                cadastralSections={cadastralSections}
                occupationStatus={occupationStatus}
                dpeStatus={dpeStatus}
                commercials={commercials}
              />
            )}

            {activeTab === 'purchase-offer' && selectedMandate && (
              <PurchaseOfferTab
                offer={selectedMandate.purchaseOffers?.[0] || {
                  id: crypto.randomUUID(),
                  date: new Date().toISOString().split('T')[0],
                  amount: 0,
                  personalContribution: 0,
                  monthlyIncome: 0,
                  currentLoans: 0,
                  deposit: 0,
                  buyers: [{
                    type: 'individual',
                    title: 'Mr',
                    firstName: '',
                    lastName: '',
                    address: { fullAddress: '' },
                    phone: '',
                    email: '',
                    hasFrenchTaxResidence: true,
                    marriageDetails: {
                      date: '',
                      place: '',
                      regime: 'community',
                    },
                  }]
                }}
                onOfferChange={(field, value) => {
                  const updatedMandate = { ...selectedMandate };
                  if (!updatedMandate.purchaseOffers) {
                    updatedMandate.purchaseOffers = [{
                      id: crypto.randomUUID(),
                      date: new Date().toISOString().split('T')[0],
                      amount: 0,
                      personalContribution: 0,
                      monthlyIncome: 0,
                      currentLoans: 0,
                      deposit: 0,
                      buyers: [{
                        type: 'individual',
                        title: 'Mr',
                        firstName: '',
                        lastName: '',
                        address: { fullAddress: '' },
                        phone: '',
                        email: '',
                        hasFrenchTaxResidence: true,
                        marriageDetails: {
                          date: '',
                          place: '',
                          regime: 'community',
                        },
                      }]
                    }];
                  }
                  updatedMandate.purchaseOffers[0] = {
                    ...updatedMandate.purchaseOffers[0],
                    [field]: value
                  };
                  updateSelectedMandate('purchaseOffers', updatedMandate.purchaseOffers);
                }}
                onBuyerChange={(index, buyer) => {
                  const updatedMandate = { ...selectedMandate };
                  if (!updatedMandate.purchaseOffers) {
                    updatedMandate.purchaseOffers = [{
                      id: crypto.randomUUID(),
                      date: new Date().toISOString().split('T')[0],
                      amount: 0,
                      personalContribution: 0,
                      monthlyIncome: 0,
                      currentLoans: 0,
                      deposit: 0,
                      buyers: [{
                        type: 'individual',
                        title: 'Mr',
                        firstName: '',
                        lastName: '',
                        address: { fullAddress: '' },
                        phone: '',
                        email: '',
                        hasFrenchTaxResidence: true,
                        marriageDetails: {
                          date: '',
                          place: '',
                          regime: 'community',
                        },
                      }]
                    }];
                  }
                  updatedMandate.purchaseOffers[0].buyers[index] = buyer;
                  updateSelectedMandate('purchaseOffers', updatedMandate.purchaseOffers);
                }}
                onAddBuyer={() => {
                  const updatedMandate = { ...selectedMandate };
                  if (!updatedMandate.purchaseOffers) {
                    updatedMandate.purchaseOffers = [{
                      id: crypto.randomUUID(),
                      date: new Date().toISOString().split('T')[0],
                      amount: 0,
                      personalContribution: 0,
                      monthlyIncome: 0,
                      currentLoans: 0,
                      deposit: 0,
                      buyers: []
                    }];
                  }
                  updatedMandate.purchaseOffers[0].buyers.push({
                    type: 'individual',
                    title: 'Mr',
                    firstName: '',
                    lastName: '',
                    address: { fullAddress: '' },
                    phone: '',
                    email: '',
                    hasFrenchTaxResidence: true,
                    marriageDetails: {
                      date: '',
                      place: '',
                      regime: 'community',
                    },
                  });
                  updateSelectedMandate('purchaseOffers', updatedMandate.purchaseOffers);
                }}
                onRemoveBuyer={(index) => {
                  const updatedMandate = { ...selectedMandate };
                  if (updatedMandate.purchaseOffers?.[0].buyers.length > 1) {
                    updatedMandate.purchaseOffers[0].buyers.splice(index, 1);
                    updateSelectedMandate('purchaseOffers', updatedMandate.purchaseOffers);
                  }
                }}
              />
            )}

            {activeTab === 'compromise' && selectedMandate && (
              <CompromiseTab
                mandate={selectedMandate}
                sellers={sellers}
                offer={selectedMandate.purchaseOffers?.[0]}
                commercials={commercials}
                propertyType={propertyType}
              />
            )}

            <div className="flex justify-end mt-8">
              {activeTab === 'sellers' && (
                <button
                  onClick={() => setActiveTab('property')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
                >
                  Suivant
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              )}
              {activeTab === 'property' && (
                <button
                  onClick={() => setActiveTab('mandate')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
                >
                  Suivant
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;