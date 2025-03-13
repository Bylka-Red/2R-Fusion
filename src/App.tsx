import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Settings, LogOut, FileText } from 'lucide-react';
import { SellersTab } from './components/SellersTab';
import { PropertyTab } from './components/PropertyTab';
import { MandateTab } from './components/MandateTab';
import { EstimationsTab } from './components/EstimationsTab';
import { MandatesList } from './components/MandatesList';
import { HomePage } from './components/HomePage';
import { SettingsTab } from './components/SettingsTab';
import { PurchaseOfferTab } from './components/PurchaseOfferTab';
import { CompromiseTab } from './components/CompromiseTab';
import { RoomAreaInput } from './components/RoomAreaInput';
import { AuthForm } from './components/AuthForm';
import { supabase } from './lib/supabase';
import { DashboardIcon } from './components/DashboardIcon';
import { DashboardModal } from './components/DashboardModal';
import type { Seller, PropertyLot, PropertyAddress, CadastralSection, Mandate, OccupationStatus, DPEStatus, Estimation, Commercial } from './types';

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
    phone: '06 18 24 46 40',
    email: 'contact@2r-immobilier.fr',
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

const tabs = [
  { id: 1, name: 'Propriétaires' },
  { id: 2, name: 'Surfaces' },
  { id: 3, name: 'Bien' },
  { id: 4, name: 'Évaluation' },
  { id: 5, name: 'Diagnostics' },
  { id: 6, name: 'Générer' },
];

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState<'home' | 'estimations' | 'mandates' | 'settings'>('home');
  const [activeTab, setActiveTab] = useState('sellers');
  const [selectedMandate, setSelectedMandate] = useState<Mandate | null>(null);
  const [mandates, setMandates] = useState<Mandate[]>([testMandate]);
  const [estimations, setEstimations] = useState<Estimation[]>(() =>
    loadFromLocalStorage('estimations', [])
  );
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
  const [commercials, setCommercials] = useState<Commercial[]>(() =>
    loadFromLocalStorage('commercials', initialCommercials)
  );
  const [showNotes, setShowNotes] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('estimations', JSON.stringify(estimations));
    } catch (error) {
      console.error('Error saving estimations to localStorage:', error);
    }
  }, [estimations]);

  useEffect(() => {
    try {
      localStorage.setItem('commercials', JSON.stringify(commercials));
    } catch (error) {
      console.error('Error saving commercials to localStorage:', error);
    }
  }, [commercials]);

  if (!session) {
    return <AuthForm />;
  }

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

      const updatedEstimation = { ...estimation, status: 'converted' as const };
      setEstimations(prevEstimations =>
        prevEstimations.map(est =>
          est.id === estimation.id ? updatedEstimation : est
        )
      );

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
          <div className="flex space-x-4 items-center">
            <DashboardIcon onClick={() => setShowDashboard(true)} />
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
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 rounded-lg text-white hover:bg-[#097339] transition-colors flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );

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
            />
          </div>
        );
    }
  };

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
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedMandate(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Retour à la liste
                </button>
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
            </div>

            {showNotes && (
              <div className="notes-popup bg-white p-4 rounded shadow-md">
                <p>Vos notes ici...</p>
              </div>
            )}

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

      <DashboardModal
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
        estimations={estimations}
      />
    </div>
  );
}

export default App;
