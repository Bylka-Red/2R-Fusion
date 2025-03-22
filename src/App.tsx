import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Settings, LogOut, FileText, Save, Loader2 } from 'lucide-react';
import { SellersTab } from './components/SellersTab';
import { PropertyTab } from './components/PropertyTab';
import { MandateTab } from './components/MandateTab';
import { EstimationsTab } from './components/EstimationsTab';
import { MandatesList } from './components/MandatesList';
import { HomePage } from './components/HomePage';
import { SettingsTab } from './components/SettingsTab';
import { PurchaseOfferTab } from './components/PurchaseOfferTab';
import { CompromiseTab } from './components/CompromiseTab';
import { AuthForm } from './components/AuthForm';
import { supabase } from './lib/supabase';
import { DashboardIcon } from './components/DashboardIcon';
import { DashboardModal } from './components/DashboardModal';
import type { Seller, PropertyLot, PropertyAddress, CadastralSection, Mandate, OccupationStatus, DPEStatus, Estimation, Commercial } from './types';
import { saveMandate } from './services/mandateService';

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState<'home' | 'estimations' | 'mandates' | 'settings'>('home');
  const [activeTab, setActiveTab] = useState('sellers');
  const [selectedMandate, setSelectedMandate] = useState<Mandate | null>(null);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [propertyAddress, setPropertyAddress] = useState(selectedMandate?.propertyAddress || { fullAddress: '' });
  const [propertyType, setPropertyType] = useState<'monopropriete' | 'copropriete'>(selectedMandate?.propertyType || 'copropriete');
  const [propertyFamilyType, setPropertyFamilyType] = useState<'personal-not-family' | 'personal-family'>(selectedMandate?.propertyFamilyType || 'personal-not-family');
  const [coPropertyAddress, setCoPropertyAddress] = useState(selectedMandate?.coPropertyAddress || { fullAddress: '' });
  const [lots, setLots] = useState(selectedMandate?.lots || []);
  const [officialDesignation, setOfficialDesignation] = useState(selectedMandate?.officialDesignation || '');
  const [cadastralSections, setCadastralSections] = useState(selectedMandate?.cadastralSections || []);
  const [occupationStatus, setOccupationStatus] = useState<OccupationStatus>(selectedMandate?.occupationStatus || 'occupied-by-seller');
  const [dpeStatus, setDpeStatus] = useState<DPEStatus>(selectedMandate?.dpeStatus || 'completed');
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [commercials] = useState<Commercial[]>([
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
  ]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchMandates();
      fetchEstimations();
    }
  }, [session]);

  useEffect(() => {
    if (selectedMandate) {
      setSelectedMandate({
        ...selectedMandate,
        occupationStatus,
        dpeStatus
      });
    }
  }, [occupationStatus, dpeStatus]);

  const fetchMandates = async () => {
    try {
      const { data, error } = await supabase
        .from('mandats')
        .select('*')
        .order('mandate_number', { ascending: true });

      if (error) throw error;

      console.log("Fetched mandates:", data);
      setMandates(data);
    } catch (error) {
      console.error("Error fetching mandates:", error);
    }
  };

  const fetchEstimations = async () => {
    try {
      const { data, error } = await supabase
        .from('estimations')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      console.log("Fetched estimations:", data);
      setEstimations(data);
    } catch (error) {
      console.error("Error fetching estimations:", error);
    }
  };

  if (!session) {
    return <AuthForm />;
  }

  // Ajout d'une fonction utilitaire pour synchroniser les états avec selectedMandate
  const syncSelectedMandate = () => {
    if (!selectedMandate) return;

    const updatedMandate = {
      ...selectedMandate,
      sellers,
      propertyAddress,
      propertyType,
      propertyFamilyType,
      coPropertyAddress,
      lots,
      officialDesignation,
      cadastralSections,
      occupationStatus,
      dpeStatus,
    };

    console.log("Syncing mandate state:", {
      sellers: updatedMandate.sellers,
      officialDesignation: updatedMandate.officialDesignation,
      propertyType: updatedMandate.propertyType
    });

    setSelectedMandate(updatedMandate);
    return updatedMandate;
  };

  const handleSaveMandate = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);

      if (!selectedMandate) {
        throw new Error('Aucun mandat sélectionné');
      }

      // Synchroniser les états avant la sauvegarde
      const updatedMandate = syncSelectedMandate();
      if (!updatedMandate) {
        throw new Error('Erreur lors de la synchronisation des données');
      }

      console.log("Saving mandate with synced data:", {
        lastName: updatedMandate.sellers?.[0]?.lastName,
        officialDesignation: updatedMandate.officialDesignation,
        propertyType: updatedMandate.propertyType
      });

      const savedMandate = await saveMandate(updatedMandate);

      if (savedMandate) {
        setSaveSuccess(true);

        const finalMandate = {
          ...updatedMandate,
          netPrice: savedMandate.net_price,
          fees: {
            ttc: savedMandate.fees_ttc,
            ht: savedMandate.fees_ht
          }
        };

        setSelectedMandate(finalMandate);
        setMandates(prevMandates =>
          prevMandates.map(m =>
            m.mandate_number === finalMandate.mandate_number ? finalMandate : m
          )
        );

        await fetchMandates();
      }
    } catch (error) {
      console.error('Error saving mandate:', error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const createNewMandate = () => {
    console.log("Creating a new mandate...");
    const newMandate: Mandate = {
      date: new Date().toISOString().split('T')[0],
      type: 'exclusive',
      mandate_number: `2024-${(mandates.length + 1).toString().padStart(3, '0')}`,
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

    console.log("New mandate created:", newMandate);
    setMandates([...mandates, newMandate]);
    setSelectedMandate(newMandate);
    setActiveTab('sellers');

    setSellers([{
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
      }
    }]);

    setPropertyAddress({ fullAddress: '' });
    setPropertyType('copropriete');
    setPropertyFamilyType('personal-not-family');
    setCoPropertyAddress({ fullAddress: '' });
    setLots([]);
    setOfficialDesignation('');
    setCadastralSections([]);
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

    console.log("Updating selected mandate:", updatedMandate);
    setSelectedMandate(updatedMandate);
    setMandates(mandates.map(m =>
      m.mandate_number === selectedMandate.mandate_number ? updatedMandate : m
    ));
  };

  const deleteMandate = (mandate_number: string) => {
    console.log("Deleting mandate:", mandate_number);
    setMandates(mandates.filter(m => m.mandate_number !== mandate_number));
    if (selectedMandate?.mandate_number === mandate_number) {
      setSelectedMandate(null);
    }
  };

  const handleMandateSelect = (mandate: Mandate) => {
    console.log("Selecting mandate:", mandate);
    setSelectedMandate(mandate);
    setActiveTab('sellers');
    setSellers(mandate.sellers);
    setPropertyAddress(mandate.propertyAddress);
    setPropertyType(mandate.propertyType);
    setPropertyFamilyType(mandate.propertyFamilyType);
    setCoPropertyAddress(mandate.coPropertyAddress || { fullAddress: '' });
    setLots(mandate.lots || []);
    setOfficialDesignation(mandate.officialDesignation || '');
    setCadastralSections(mandate.cadastralSections || []);
    setOccupationStatus(mandate.occupationStatus || 'occupied-by-seller');
    setDpeStatus(mandate.dpeStatus || 'completed');
  };

  const handlePropertyAddressChange = (address: { fullAddress: string }) => {
    setPropertyAddress(address);
    setSelectedMandate(prevMandate => ({ ...prevMandate, propertyAddress: address }));
  };

  const handlePropertyTypeChange = (type: 'monopropriete' | 'copropriete') => {
    console.log("Updating property type:", type);
    setPropertyType(type);

    // Mettre à jour selectedMandate immédiatement
    if (selectedMandate) {
      const updatedMandate = {
        ...selectedMandate,
        propertyType: type
      };
      setSelectedMandate(updatedMandate);
      console.log("Updated selectedMandate with new property type:", updatedMandate.propertyType);
    }
  };

  const handlePropertyFamilyTypeChange = (type: 'personal-not-family' | 'personal-family') => {
    setPropertyFamilyType(type);
    setSelectedMandate(prevMandate => ({ ...prevMandate, propertyFamilyType: type }));
  };

  const handleCoPropertyAddressChange = (address: { fullAddress: string }) => {
    setCoPropertyAddress(address);
    setSelectedMandate(prevMandate => ({ ...prevMandate, coPropertyAddress: address }));
  };

  const handleLotsChange = (lots: PropertyLot[]) => {
    setLots(lots);
    setSelectedMandate(prevMandate => ({ ...prevMandate, lots: lots }));
  };

  const handleOfficialDesignationChange = (designation: string) => {
    console.log("Updating official designation:", designation);
    setOfficialDesignation(designation);

    // Mettre à jour selectedMandate immédiatement
    if (selectedMandate) {
      const updatedMandate = {
        ...selectedMandate,
        officialDesignation: designation
      };
      setSelectedMandate(updatedMandate);
      console.log("Updated selectedMandate with new designation:", updatedMandate.officialDesignation);
    }
  };

  const handleCadastralSectionsChange = (sections: CadastralSection[]) => {
    setCadastralSections(sections);
    setSelectedMandate(prevMandate => ({ ...prevMandate, cadastralSections: sections }));
  };

  const handleSellersChange = (sellers: Seller[]) => {
    setSellers(sellers);
    setSelectedMandate(prevMandate => ({ ...prevMandate, sellers: sellers }));
  };

  const handleNetPriceChange = (price: number) => {
    setNetPrice(price);
    setSelectedMandate(prevMandate => ({ ...prevMandate, netPrice: price }));
  };

  const handleFeesChange = (fees: { ttc: number; ht: number }) => {
    setFees(fees);
    setSelectedMandate(prevMandate => ({ ...prevMandate, fees: fees }));
  };

  const handleOccupationStatusChange = (status: OccupationStatus) => {
    setOccupationStatus(status);
    setSelectedMandate(prevMandate => ({ ...prevMandate, occupationStatus: status }));
  };

  const handleDpeStatusChange = (status: DPEStatus) => {
    setDpeStatus(status);
    setSelectedMandate(prevMandate => ({ ...prevMandate, dpeStatus: status }));
  };

  const handleSellerChange = (index: number, updatedSeller: Seller) => {
    console.log(`Updating seller at index ${index}:`, updatedSeller);
    const newSellers = [...sellers];
    newSellers[index] = updatedSeller;
    setSellers(newSellers);

    // Mettre à jour selectedMandate immédiatement
    if (selectedMandate) {
      const updatedMandate = {
        ...selectedMandate,
        sellers: newSellers
      };
      setSelectedMandate(updatedMandate);
      console.log("Updated selectedMandate with new seller:", updatedMandate.sellers[index]);
    }
  };

  const addSeller = () => {
    console.log("Adding a new seller.");
    setSellers([...sellers, {
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
      }
    }]);
  };

  const removeSeller = (index: number) => {
    console.log(`Removing seller at index ${index}.`);
    setSellers(sellers.filter((_, i) => i !== index));
  };

  const copyFirstSellerAddress = () => {
    if (sellers.length > 0 && sellers[0].address) {
      console.log("Copying first seller's address.");
      setPropertyAddress({ ...sellers[0].address });
    }
  };

  const handleConvertEstimationToMandate = (estimation: Estimation) => {
    if (window.confirm('Êtes-vous sûr de vouloir convertir cette estimation en mandat de vente ?')) {
      const newMandate: Mandate = {
        date: new Date().toISOString().split('T')[0],
        type: 'exclusive',
        mandate_number: `2024-${(mandates.length + 1).toString().padStart(3, '0')}`,
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

      console.log("Converting estimation to mandate:", newMandate);
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
            onCommercialsChange={() => {}}
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
              <div className="flex items-center gap-4">
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
                <button
                  onClick={() => setSelectedMandate(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Retour à la liste
                </button>
                <button
                  onClick={handleSaveMandate}
                  disabled={isSaving}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043] ${
                    isSaving ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>

            {saveError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                Le mandat a été enregistré avec succès.
              </div>
            )}

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
                      buyers: []
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
