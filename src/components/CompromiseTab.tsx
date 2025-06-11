import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Euro, Plus, Trash2, Save, Loader2, Download } from 'lucide-react';
import type { Mandate, Seller, Commercial, PurchaseOffer, KitchenFurnitureItem, DiagnosticInfo } from '../types';
import { AddressAutocomplete } from './AddressAutocomplete';
import { NotaireSearch } from './NotaireSearch';
import { SyndicSearch } from './SyndicSearch';
import { KitchenFurnitureModal } from './KitchenFurnitureModal';
import type { Notaire } from '../services/notaireService';
import type { Syndic } from '../services/syndicService';
import { saveCompromiseDetails, getCompromiseDetails } from '../services/compromiseService';
import { generateCompromiseFromTemplate } from './CompromiseTemplateGenerator';

interface DiagnosticType {
  id: string;
  name: string;
  label: string;
  required: boolean;
  order: number;
  conditionallyRequired?: (propertyType: string, isInCopropriete: boolean) => boolean;
}

const diagnosticTypes: DiagnosticType[] = [
  { id: 'dpe', name: 'dpe', label: 'DPE', required: true, order: 1 },
  {
    id: 'carrez',
    name: 'carrez',
    label: 'Loi Carrez',
    required: false,
    order: 2,
    conditionallyRequired: (propertyType, isInCopropriete) =>
      propertyType === 'copropriete' || isInCopropriete
  },
  { id: 'erp', name: 'erp', label: 'ERP', required: true, order: 3 },
  { id: 'sanitation', name: 'sanitation', label: 'Assainissement', required: true, order: 4 },
  { id: 'electricity', name: 'electricity', label: 'Électricité', required: false, order: 5 },
  { id: 'gas', name: 'gas', label: 'Gaz', required: false, order: 6 },
  { id: 'asbestos', name: 'asbestos', label: 'Amiante', required: false, order: 7 },
  { id: 'lead', name: 'lead', label: 'Plomb', required: false, order: 8 },
  { id: 'termites', name: 'termites', label: 'Termites', required: false, order: 9 },
  { id: 'audit-energetique', name: 'audit-energetique', label: 'Audit Énergétique', required: true, order: 10 }, // Ajout du diagnostic 'Audit Énergétique'
];

interface CompromiseTabProps {
  mandate: Mandate;
  sellers: Seller[];
  offer?: PurchaseOffer;
  commercials: Commercial[];
  propertyType: 'monopropriete' | 'copropriete';
  isInCopropriete: boolean;
}

export function CompromiseTab({
  mandate,
  sellers,
  offer,
  commercials,
  propertyType,
  isInCopropriete
}: CompromiseTabProps) {
  const [compromiseNumber, setCompromiseNumber] = useState('');
  const [compromiseDate, setCompromiseDate] = useState('');
  const [previousOwner, setPreviousOwner] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [exitCommercial, setExitCommercial] = useState(mandate.commercial);
  const [enjoymentDate, setEnjoymentDate] = useState(() => {
    if (compromiseDate) {
      const date = new Date(compromiseDate);
      if (!isNaN(date.getTime())) {
        date.setMonth(date.getMonth() + 3);
        return date.toISOString().split('T')[0];
      }
    }
    return '';
  });
  const [kitchenPrice, setKitchenPrice] = useState(0);
  const [deposit, setDeposit] = useState(offer?.deposit || 0);
  const [selectedNotaireVendeur, setSelectedNotaireVendeur] = useState<Notaire | null>(mandate.notaireVendeur || null);
  const [selectedNotaireAcquereur, setSelectedNotaireAcquereur] = useState<Notaire | null>(mandate.notaireAcquereur || null);
  const [selectedSyndic, setSelectedSyndic] = useState<Syndic | null>(mandate.syndic || null);
  const [showNotaireVendeurSearch, setShowNotaireVendeurSearch] = useState(false);
  const [showNotaireAcquereurSearch, setShowNotaireAcquereurSearch] = useState(false);
  const [showSyndicSearch, setShowSyndicSearch] = useState(false);
  const [showKitchenFurnitureModal, setShowKitchenFurnitureModal] = useState(false);
  const [kitchenFurniture, setKitchenFurniture] = useState<KitchenFurnitureItem[]>(
    mandate.kitchenFurniture || []
  );
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo[]>([]);
  const [selectedDiagnostics, setSelectedDiagnostics] = useState<Set<string>>(new Set());
  const [diagnosticsInfo, setDiagnosticsInfo] = useState<{ [key: string]: Partial<DiagnosticInfo> }>({});

  const [lastMeetingDates, setLastMeetingDates] = useState<string[]>(['', '', '']);
  const [preEtatDate, setPreEtatDate] = useState('');
  const [reglementDate, setReglementDate] = useState('');
  const [modifReglementDates, setModifReglementDates] = useState<string[]>([]);
  const [isCarnetEntretienRequired, setIsCarnetEntretienRequired] = useState(false);
  const [isFicheImmatriculationRequired, setIsFicheImmatriculationRequired] = useState(false);
  const [isFicheSynthetiqueRequired, setIsFicheSynthetiqueRequired] = useState(false);
  const [energyAuditDate, setEnergyAuditDate] = useState(''); // Ajout de l'état pour la date d'audit énergétique

  const saveButtonRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Ajouter un état pour les honoraires TTC
  const [honorairesTTC, setHonorairesTTC] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      if (!mandate.mandate_number) return;

      const details = await getCompromiseDetails(mandate.mandate_number);
      if (details) {
        setCompromiseNumber(details.number || '');
        setExitCommercial(details.commercial || '');
        setCompromiseDate(details.date || '');
        setEnjoymentDate(details.enjoymentDate || '');
        setPreviousOwner(details.previousOwner || '');
        setRegistrationDate(details.registrationDate || '');
        setPreEtatDate(details.preStatusDate || '');
        setReglementDate(details.condoRulesDate || '');
        setModifReglementDates(details.condoRulesModifications || []);
        setIsCarnetEntretienRequired(details.hasMaintenanceLog || false);
        setIsFicheImmatriculationRequired(details.hasRegistrationForm || false);
        setIsFicheSynthetiqueRequired(details.hasSyntheticSheet || false);
        setSelectedNotaireVendeur(details.notaireVendeur);
        setSelectedNotaireAcquereur(details.notaireAcquereur);
        setSelectedSyndic(details.syndic);
        setEnergyAuditDate(details.energyAuditDate || ''); // Initialiser la date d'audit énergétique

        if (details.agDates) {
          setLastMeetingDates([
            details.agDates.n1 || '',
            details.agDates.n2 || '',
            details.agDates.n3 || ''
          ]);
        }

        // Initialiser les honoraires TTC à une chaîne vide
        setHonorairesTTC('');
      }
    };
    loadInitialData();
  }, [mandate.mandate_number]);

  useEffect(() => {
    const requiredDiagnostics = new Set<string>();
    diagnosticTypes.forEach(type => {
      if (type.required ||
         (type.conditionallyRequired && type.conditionallyRequired(propertyType, isInCopropriete))) {
        requiredDiagnostics.add(type.id);
      }
    });
    setSelectedDiagnostics(requiredDiagnostics);
  }, [propertyType, isInCopropriete]);

  const [priceHAIWithoutKitchen, setPriceHAIWithoutKitchen] = useState(mandate.netPrice - kitchenPrice);

  useEffect(() => {
    const newPriceHAIWithoutKitchen = mandate.netPrice - kitchenPrice;
    if (priceHAIWithoutKitchen !== newPriceHAIWithoutKitchen) {
      setPriceHAIWithoutKitchen(newPriceHAIWithoutKitchen);
    }
  }, [mandate.netPrice, kitchenPrice]);

  const handleSave = async () => {
    if (!mandate.mandate_number || isSaving) return;
  
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
  
      const result = await saveCompromiseDetails(mandate.mandate_number, {
        number: compromiseNumber,
        commercial: exitCommercial,
        date: compromiseDate,
        enjoymentDate: enjoymentDate,
        conditionsEndDate: getSuspensiveConditionsEndDate(),
        folderName: `${sellers.map(s => s.lastName).join(' & ')} / ${offer?.buyers.map(b => b.lastName).join(' & ') || ''}`,
        notaireVendeur: selectedNotaireVendeur,
        notaireAcquereur: selectedNotaireAcquereur,
        syndic: selectedSyndic,
        previousOwner: previousOwner,
        registrationDate: registrationDate,
        agDates: {
          n1: lastMeetingDates[0],
          n2: lastMeetingDates[1],
          n3: lastMeetingDates[2]
        },
        preStatusDate: preEtatDate,
        condoRulesDate: reglementDate,
        condoRulesModifications: modifReglementDates,
        hasMaintenanceLog: isCarnetEntretienRequired,
        hasRegistrationForm: isFicheImmatriculationRequired,
        hasSyntheticSheet: isFicheSynthetiqueRequired,
        priceWithFurniture: kitchenPrice,
        kitchenPrice: kitchenPrice,
        priceWithoutKitchen: priceHAIWithoutKitchen,
        totalPrice: mandate.netPrice + kitchenPrice,
        penaltyClause: Math.round(mandate.netPrice * 0.1).toString(),
        notaryFees: Math.round(priceHAIWithoutKitchen * 0.083),
        maxMonthlyPayment: Math.floor((offer?.monthlyIncome || 0) / 3),
        vatAmount: calculateVAT(honorairesTTC),
        diagnostics: diagnostics,
        compromiseSignatureDate: null,
        energyAuditDate: energyAuditDate // Ajout de la date d'audit énergétique
      });
  
      // Mise à jour des états locaux avec les données retournées
      setCompromiseNumber(result.number || '');
      setExitCommercial(result.commercial || '');
      setCompromiseDate(result.date || '');
      setEnjoymentDate(result.enjoymentDate || '');
      setPreviousOwner(result.previousOwner || '');
      setRegistrationDate(result.registrationDate || '');
      setPreEtatDate(result.preStatusDate || '');
      setReglementDate(result.condoRulesDate || '');
      setModifReglementDates(result.condoRulesModifications || []);
      setIsCarnetEntretienRequired(result.hasMaintenanceLog || false);
      setIsFicheImmatriculationRequired(result.hasRegistrationForm || false);
      setIsFicheSynthetiqueRequired(result.hasSyntheticSheet || false);
      setSelectedNotaireVendeur(result.notaireVendeur);
      setSelectedNotaireAcquereur(result.notaireAcquereur);
      setSelectedSyndic(result.syndic);
      setEnergyAuditDate(result.energyAuditDate || ''); // Mise à jour de la date d'audit énergétique
  
      if (result.agDates) {
        setLastMeetingDates([
          result.agDates.n1 || '',
          result.agDates.n2 || '',
          result.agDates.n3 || ''
        ]);
      }
  
      // Mettre à jour mandate.compromise_number ici
      mandate.compromise_number = result.number;
  
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving compromise details:', error);
      setSaveError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };
  

  const handleGenerateCompromise = async () => {
    try {
      await generateCompromiseFromTemplate(mandate);
    } catch (error) {
      console.error('Erreur lors de la génération du compromis:', error);
      alert('Une erreur est survenue lors de la génération du document. Veuillez réessayer.');
    }
  };

  const handleNotaireVendeurSelect = (notaire: Notaire) => {
    setSelectedNotaireVendeur(notaire);
    setShowNotaireVendeurSearch(false);
  };

  const handleNotaireAcquereurSelect = (notaire: Notaire) => {
    setSelectedNotaireAcquereur(notaire);
    setShowNotaireAcquereurSearch(false);
  };

  const handleSyndicSelect = (syndic: Syndic) => {
    setSelectedSyndic(syndic);
    setShowSyndicSearch(false);
  };

// Calcul de notaryFees avec arrondi
const notaryFees = Math.round(priceHAIWithoutKitchen * 0.083 / 100) * 100;

  // Calcul de totalPrice
  const totalPrice = Math.round(kitchenPrice + priceHAIWithoutKitchen + notaryFees);

  // Autres calculs
  const priceHAI = mandate.netPrice; // Utiliser mandate.netPrice au lieu de mandate.netPrice + mandate.fees.ttc
  const monthlyIncome = offer?.monthlyIncome || 0;
  const maxMonthlyPayment = Math.floor(monthlyIncome / 3);
  const penaltyClause = Math.round(mandate.netPrice * 0.1);

  // Calcul du montant de la TVA
  const calculateVAT = (honorairesTTC: string) => {
    const honoraires = parseFloat(honorairesTTC);
    if (isNaN(honoraires)) return 0;
    const htAmount = honoraires / 1.2;
    return Math.round((honoraires - htAmount) * 100) / 100;
  };

  const getSuspensiveConditionsEndDate = () => {
    if (!compromiseDate) return '';
    const date = new Date(compromiseDate);
    if (!isNaN(date.getTime())) {
      date.setDate(date.getDate() + 60);
      return date.toISOString().split('T')[0];
    }
    return '';
  };

  const handleKitchenFurnitureSave = (items: KitchenFurnitureItem[]) => {
    setKitchenFurniture(items);
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    setKitchenPrice(totalPrice);
  };

  const handleAddDiagnostic = () => {
    setShowDiagnosticsModal(true);
  };

  const handleDiagnosticSelect = (diagnosticId: string, checked: boolean) => {
    setSelectedDiagnostics((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (checked) {
        newSelected.add(diagnosticId);
      } else if (!diagnosticTypes.find(t => t.id === diagnosticId)?.required) {
        newSelected.delete(diagnosticId);
      }
      return newSelected;
    });

    if (checked && !diagnosticsInfo[diagnosticId]) {
      setDiagnosticsInfo((prevInfo) => ({
        ...prevInfo,
        [diagnosticId]: {
          id: crypto.randomUUID(),
          type: diagnosticId,
          status: 'completed',
          date: new Date().toISOString().split('T')[0],
          provider: '',
        },
      }));
    }
  };

  const handleDiagnosticSave = () => {
    const newDiagnostics: DiagnosticInfo[] = [];

    Array.from(selectedDiagnostics).forEach((diagnosticId) => {
      const diagnosticInfo = diagnosticsInfo[diagnosticId];
      if (diagnosticInfo && diagnosticInfo.type) {
        const diagnostic: DiagnosticInfo = {
          id: diagnosticInfo.id || crypto.randomUUID(),
          type: diagnosticInfo.type,
          status: diagnosticInfo.status || 'completed',
          date: diagnosticInfo.date,
          validUntil: diagnosticInfo.validUntil,
          provider: diagnosticInfo.provider,
          asbestosPresence: diagnosticInfo.type === 'asbestos' ? diagnosticInfo.asbestosPresence : undefined,
          leadPresence: diagnosticInfo.type === 'lead' ? diagnosticInfo.leadPresence : undefined,
          leadConcentration: diagnosticInfo.type === 'lead' ? diagnosticInfo.leadConcentration : undefined,
          sanitationStatus: diagnosticInfo.type === 'sanitation' ? diagnosticInfo.sanitationStatus : undefined,
          diagnosticCompany: diagnosticInfo.diagnosticCompany,
        } as DiagnosticInfo;

        newDiagnostics.push(diagnostic);
      }
    });

    setDiagnostics((prevDiagnostics) => {
      const updatedDiagnostics = [...prevDiagnostics];

      newDiagnostics.forEach((newDiagnostic) => {
        const existingIndex = updatedDiagnostics.findIndex(d => d.type === newDiagnostic.type);
        if (existingIndex !== -1) {
          updatedDiagnostics[existingIndex] = newDiagnostic;
        } else {
          updatedDiagnostics.push(newDiagnostic);
        }
      });

      return updatedDiagnostics;
    });

    setShowDiagnosticsModal(false);
  };

  const handleDiagnosticDelete = (id: string) => {
    setDiagnostics(prevDiagnostics => prevDiagnostics.filter(d => d.id !== id));
  };

  const folderName = `${sellers.map(s => s.lastName).join(' & ')} / ${offer?.buyers.map(b => b.lastName).join(' & ') || ''}`;

  const needsSyndic = propertyType === 'copropriete' || isInCopropriete;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Compromis de vente</h2>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
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
          <button
            onClick={handleGenerateCompromise}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-5 w-5 mr-2" />
            Générer le compromis
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
          Le compromis a été enregistré avec succès.
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Infos Compromis</h2>
            </div>

            {saveError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                Les informations du compromis ont été enregistrées avec succès.
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span>Nom du dossier</span>
                    <input
                      type="text"
                      value={folderName}
                      disabled
                      className="bg-gray-50"
                    />
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span>Numéro de compromis</span>
                    <input
                      type="text"
                      value={compromiseNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log("Updating compromise number:", value);
                        setCompromiseNumber(value);
                      }}
                      placeholder="Ex: COMP-2024-001"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span>Commercial Vente</span>
                    <select
                      value={exitCommercial}
                      onChange={(e) => setExitCommercial(e.target.value)}
                      className="w-full"
                    >
                      {commercials.map((commercial) => (
                        <option key={commercial.id} value={commercial.firstName}>
                          {commercial.firstName}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span>Date du compromis</span>
                    <input
                      type="date"
                      value={compromiseDate}
                      onChange={(e) => setCompromiseDate(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span>Date d'entrée en jouissance</span>
                    <input
                      type="date"
                      value={enjoymentDate}
                      onChange={(e) => setEnjoymentDate(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span>Date Fin conditions suspensives</span>
                    <input
                      type="date"
                      value={getSuspensiveConditionsEndDate()}
                      disabled
                      className="bg-gray-50"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <h3 className="text-lg font-medium text-gray-900">Notaire Vendeur</h3>
                  <button
                    onClick={() => setShowNotaireVendeurSearch(true)}
                    className="text-primary hover:text-primary-dark flex items-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {showNotaireVendeurSearch && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Sélectionner un notaire vendeur</h3>
                        <button
                          onClick={() => setShowNotaireVendeurSearch(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      <NotaireSearch
                        onSelect={handleNotaireVendeurSelect}
                        selectedNotaire={selectedNotaireVendeur}
                      />
                    </div>
                  </div>
                )}

                {selectedNotaireVendeur && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium">{selectedNotaireVendeur.nom}</div>
                    <div className="text-sm text-gray-600">{selectedNotaireVendeur.adresse}</div>
                    <div className="text-sm text-gray-600">{selectedNotaireVendeur.telephone}</div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Notaire Acquéreur
                    {selectedNotaireAcquereur && (
                      <button
                        onClick={() => setSelectedNotaireAcquereur(null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowNotaireAcquereurSearch(true)}
                    className="text-primary hover:text-primary-dark flex items-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {showNotaireAcquereurSearch && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Sélectionner un notaire acquéreur</h3>
                        <button
                          onClick={() => setShowNotaireAcquereurSearch(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      <NotaireSearch
                        onSelect={handleNotaireAcquereurSelect}
                        selectedNotaire={selectedNotaireAcquereur}
                      />
                    </div>
                  </div>
                )}

                {selectedNotaireAcquereur && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium">{selectedNotaireAcquereur.nom}</div>
                    <div className="text-sm text-gray-600">{selectedNotaireAcquereur.adresse}</div>
                    <div className="text-sm text-gray-600">{selectedNotaireAcquereur.telephone}</div>
                  </div>
                )}
              </div>

              {needsSyndic && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    <h3 className="text-lg font-medium text-gray-900">Syndic</h3>
                    <button
                      onClick={() => setShowSyndicSearch(true)}
                      className="text-primary hover:text-primary-dark flex items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {showSyndicSearch && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Sélectionner un syndic</h3>
                          <button
                            onClick={() => setShowSyndicSearch(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                        <SyndicSearch
                          onSelect={handleSyndicSelect}
                          selectedSyndic={selectedSyndic}
                        />
                      </div>
                    </div>
                  )}

                  {selectedSyndic && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium">{selectedSyndic.nom}</div>
                      <div className="text-sm text-gray-600">{selectedSyndic.adresse}</div>
                      <div className="text-sm text-gray-600">{selectedSyndic.telephone}</div>
                      <div className="text-sm text-gray-600">{selectedSyndic.email}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span>Précédent propriétaire</span>
                    <input
                      type="text"
                      value={previousOwner}
                      onChange={(e) => setPreviousOwner(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span>Date de l'enregistrement</span>
                    <input
                      type="date"
                      value={registrationDate}
                      onChange={(e) => setRegistrationDate(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {(propertyType === 'copropriete' || isInCopropriete) && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Infos Copro</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {lastMeetingDates.map((date, index) => (
                    <div key={index}>
                      <label className="block">
                        <span>{`Date AG N-${index + 1}`}</span>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => {
                            const newDates = [...lastMeetingDates];
                            newDates[index] = e.target.value;
                            setLastMeetingDates(newDates);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block">
                      <span>Date du Pré état Daté</span>
                      <input
                        type="date"
                        value={preEtatDate}
                        onChange={(e) => setPreEtatDate(e.target.value)}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block">
                      <span>Date du Règlement de Copropriété</span>
                      <input
                        type="date"
                        value={reglementDate}
                        onChange={(e) => setReglementDate(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    Modifications du Règlement de Copropriété
                    <button
                      onClick={() => setModifReglementDates([...modifReglementDates, ''])}
                      className="text-primary hover:text-primary-dark flex items-center gap-1 ml-2"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </h3>
                  {modifReglementDates.map((date, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block">
                          <span>{`Date de la Modif ${index + 1}`}</span>
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                              const newDates = [...modifReglementDates];
                              newDates[index] = e.target.value;
                              setModifReglementDates(newDates);
                            }}
                          />
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          const newDates = [...modifReglementDates];
                          newDates.splice(index, 1);
                          setModifReglementDates(newDates);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Documents Nécessaires</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isCarnetEntretienRequired}
                        onChange={(e) => setIsCarnetEntretienRequired(e.target.checked)}
                        className="rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                      />
                      <span className="text-sm">Carnet d'entretien</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isFicheImmatriculationRequired}
                        onChange={(e) => setIsFicheImmatriculationRequired(e.target.checked)}
                        className="rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                      />
                      <span className="text-sm">Fiche d'immatriculation</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isFicheSynthetiqueRequired}
                        onChange={(e) => setIsFicheSynthetiqueRequired(e.target.checked)}
                        className="rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                      />
                      <span className="text-sm">Fiche Synthétique</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-yellow-500 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Infos Financières</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span>Prix F.A.I</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={priceHAI.toLocaleString('fr-FR')}
                        disabled
                        className="bg-gray-50 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Euro className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span>Prix Cuisine</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={kitchenPrice.toLocaleString('fr-FR')}
                        onChange={(e) => {
                          const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                          setKitchenPrice(value);
                        }}
                        className="pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          onClick={() => setShowKitchenFurnitureModal(true)}
                          className="text-[#0b8043] hover:text-[#097339]"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block">
      <span>Prix F.A.I sans la cuisine</span>
      <div className="relative">
        <input
          type="text"
          value={priceHAIWithoutKitchen.toLocaleString('fr-FR')}
          disabled
          className="bg-gray-50 pr-10"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Euro className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </label>
  </div>
  <div>
    <label className="block">
      <span>Prix de Vente Total</span>
      <div className="relative">
        <input
          type="text"
          value={totalPrice.toLocaleString('fr-FR')}
          disabled
          className="bg-gray-50 pr-10"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Euro className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </label>
  </div>
</div>

<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block">
      <span>Clause pénale</span>
      <div className="relative">
        <input
          type="text"
          value={penaltyClause.toLocaleString('fr-FR')}
          disabled
          className="bg-gray-50 pr-10"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Euro className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </label>
  </div>
  <div>
    <label className="block">
      <span>Frais de Notaire</span>
      <div className="relative">
        <input
          type="text"
          value={notaryFees.toLocaleString('fr-FR')}
          disabled
          className="bg-gray-50 pr-10"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Euro className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </label>
  </div>
</div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span>Apport</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={offer?.personalContribution?.toLocaleString('fr-FR') || '0'}
                        disabled
                        className="bg-gray-50 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Euro className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span>Séquestre</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={deposit.toLocaleString('fr-FR')}
                        onChange={(e) => {
                          const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                          setDeposit(value);
                        }}
                        className="pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Euro className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span>Salaires nets mensuels</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={monthlyIncome.toLocaleString('fr-FR')}
                        disabled
                        className="bg-gray-50 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Euro className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span>Mensualité Maximum</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={maxMonthlyPayment.toLocaleString('fr-FR')}
                        disabled
                        className="bg-gray-50 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Euro className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span>Honoraires TTC</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={honorairesTTC}
                        onChange={(e) => setHonorairesTTC(e.target.value)}
                        className="pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Euro className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span>Montant de la TVA</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={calculateVAT(honorairesTTC).toFixed(2)}
                        disabled
                        className="bg-gray-50 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Euro className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span>Date de l'audit énergétique</span>
                    <div className="relative">
                      <input
                        type="date"
                        value={energyAuditDate}
                        onChange={(e) => setEnergyAuditDate(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-red-500 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Diagnostics</h2>
              <button
                onClick={handleAddDiagnostic}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un diagnostic
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {diagnostics.map((diagnostic) => {
                const diagnosticType = diagnosticTypes.find(t => t.id === diagnostic.type);
                if (!diagnosticType) return null;

                return (
                  <div key={diagnostic.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {diagnosticType.label}
                        </h3>
                        {diagnostic.type === 'carrez' ? (
                          <p className="text-sm text-gray-600">
                            {diagnostic.provider ? `Société : ${diagnostic.provider}` : 'Garantie par le propriétaire'}
                          </p>
                        ) : diagnostic.provider && (
                          <p className="text-sm text-gray-600">Société : {diagnostic.provider}</p>
                        )}
                        {diagnostic.date && diagnostic.type !== 'sanitation' && (
                          <p className="text-sm text-gray-600">Date : {diagnostic.date}</p>
                        )}
                        {diagnostic.validUntil && (
                          <p className="text-sm text-gray-600">Valide jusqu'au : {diagnostic.validUntil}</p>
                        )}
                        {diagnostic.type === 'asbestos' && (
                          <p className="text-sm text-gray-600">
                            Présence d'amiante : {diagnostic.asbestosPresence ? 'Oui' : 'Non'}
                          </p>
                        )}
                        {diagnostic.type === 'lead' && (
                          <p className="text-sm text-gray-600">
                            Présence de plomb : {diagnostic.leadPresence ? 'Oui' : 'Non'}
                            {diagnostic.leadConcentration && (
                              <span>
                                {' '}(Concentration : {
                                  diagnostic.leadConcentration === 'above-threshold'
                                    ? 'Supérieure aux seuils'
                                    : 'Inférieure aux seuils'
                                })
                              </span>
                            )}
                          </p>
                        )}
                        {diagnostic.type === 'sanitation' && (
                          <p className="text-sm text-gray-600">
                            Statut : {
                              diagnostic.sanitationStatus === 'completed' ? 'Réalisé' :
                              diagnostic.sanitationStatus === 'in-progress' ? 'En cours' :
                              'Non requis'
                            }
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDiagnosticDelete(diagnostic.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        ref={saveButtonRef}
        onClick={handleSave}
        style={{ display: 'none' }}
      >
        Enregistrer
      </button>

      <KitchenFurnitureModal
        isOpen={showKitchenFurnitureModal}
        onClose={() => setShowKitchenFurnitureModal(false)}
        items={kitchenFurniture}
        onSave={handleKitchenFurnitureSave}
      />

      {showDiagnosticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Ajouter un diagnostic</h3>
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3 border-b border-gray-200 pb-6">
                <h4 className="font-medium text-gray-700">Sélectionner les diagnostics à réaliser</h4>
                <div className="grid grid-cols-2 gap-4">
                  {diagnosticTypes
                    .sort((a, b) => a.order - b.order)
                    .filter(type => {
                      if (type.id === 'carrez') {
                        return propertyType === 'copropriete' || isInCopropriete;
                      }
                      return true;
                    })
                    .map((type) => {
                      const isRequired = type.required ||
                        (type.conditionallyRequired && type.conditionallyRequired(propertyType, isInCopropriete));

                      return (
                        <label key={type.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedDiagnostics.has(type.id)}
                            onChange={(e) => handleDiagnosticSelect(type.id, e.target.checked)}
                            disabled={isRequired}
                            className="rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                          />
                          <span className="text-sm">
                            {type.label}
                            {isRequired && <span className="text-red-500 ml-1">*</span>}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {Array.from(selectedDiagnostics).map((diagnosticId) => {
                const diagnostic = diagnosticTypes.find(t => t.id === diagnosticId);
                const diagnosticInfo = diagnosticsInfo[diagnosticId] || {};

                if (!diagnostic) return null;

                return (
                  <div key={diagnosticId} className="border-b border-gray-200 pb-6">
                    <h4 className="font-medium text-gray-700 mb-4">{diagnostic.label}</h4>

                    {diagnostic.id === 'carrez' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-sm font-medium leading-6 text-gray-600 mb-0.5">
                              Garantie par
                            </span>
                            <select
                              value={diagnosticInfo.carrezGuarantor?.type || 'owner'}
                              onChange={(e) => setDiagnosticsInfo((prevInfo) => ({
                                ...prevInfo,
                                [diagnosticId]: {
                                  ...prevInfo[diagnosticId],
                                  type: diagnostic.id,
                                  carrezGuarantor: {
                                    type: e.target.value,
                                    name: e.target.value === 'owner' ? '' : diagnosticInfo.carrezGuarantor?.name || '',
                                    date: diagnosticInfo.date || ''
                                  }
                                }
                              }))}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#0b8043] focus:ring focus:ring-opacity-50"
                            >
                              <option value="owner">Propriétaire</option>
                              <option value="other">Autre (saisir manuellement)</option>
                            </select>
                          </div>
                          <div>
                            <span className="block text-sm font-medium leading-6 text-gray-600 mb-0.5">
                              Date du diagnostic
                            </span>
                            <input
                              type="date"
                              value={diagnosticInfo.date || ''}
                              onChange={(e) => setDiagnosticsInfo((prevInfo) => ({
                                ...prevInfo,
                                [diagnosticId]: {
                                  ...prevInfo[diagnosticId],
                                  type: diagnostic.id,
                                  date: e.target.value,
                                }
                              }))}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#b8043] focus:ring focus:ring-opacity-50"
                            />
                          </div>
                        </div>
                        {diagnosticInfo.carrezGuarantor?.type === 'other' && (
                          <div>
                            <span className="block text-sm font-medium leading-6 text-gray-600 mb-0.5">
                              Nom de la société
                            </span>
                            <input
                              type="text"
                              value={diagnosticInfo.provider || ''}
                              onChange={(e) => setDiagnosticsInfo((prevInfo) => ({
                                ...prevInfo,
                                [diagnosticId]: {
                                  ...prevInfo[diagnosticId],
                                  provider: e.target.value,
                                }
                              }))}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#0b8043] focus:ring focus:ring-opacity-50"
                              placeholder="Nom de la société"
                            />
                          </div>
                        )}
                      </div>
                    ) : diagnostic.id === 'sanitation' ? (
                      <div>
                        <select
                          value={diagnosticInfo.sanitationStatus || 'completed'}
                          onChange={(e) => setDiagnosticsInfo((prevInfo) => ({
                            ...prevInfo,
                            [diagnosticId]: {
                              ...prevInfo[diagnosticId],
                              type: diagnostic.id,
                              sanitationStatus: e.target.value as 'completed' | 'in-progress' | 'not-required'
                            }
                          }))}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#0b8043] focus:ring focus:ring-opacity-50"
                        >
                          <option value="completed">Réalisé</option>
                          <option value="in-progress">En cours</option>
                          <option value="not-required">Non requis</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Date du diagnostic
                            </label>
                            <input
                              type="date"
                              value={diagnosticInfo.date || ''}
                              onChange={(e) => setDiagnosticsInfo((prevInfo) => ({
                                ...prevInfo,
                                [diagnosticId]: {
                                  ...prevInfo[diagnosticId],
                                  type: diagnostic.id,
                                  date: e.target.value,
                                }
                              }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0b8043] focus:ring focus:ring-opacity-50"
                            />
                          </div>

                          {diagnostic.id !== 'erp' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Société de diagnostic
                              </label>
                              <input
                                type="text"
                                value={diagnosticInfo.provider || ''}
                                onChange={(e) => {
                                  const provider = e.target.value;
                                  setDiagnosticsInfo((prevInfo) => ({
                                    ...prevInfo,
                                    [diagnosticId]: {
                                      ...prevInfo[diagnosticId],
                                      type: diagnostic.id,
                                      provider: provider,
                                      diagnosticCompany: provider,
                                    }
                                  }));
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0b8043] focus:ring focus:ring-opacity-50"
                              />
                            </div>
                          )}
                        </div>

                        {diagnosticInfo.leadPresence && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Présence de plomb
                            </label>
                            <div className="mt-2 space-x-4">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  checked={diagnosticInfo.leadPresence === true}
                                  onChange={() => setDiagnosticsInfo((prevInfo) => ({
                                    ...prevInfo,
                                    [diagnosticId]: {
                                      ...prevInfo[diagnosticId],
                                      type: diagnostic.id,
                                      leadPresence: true,
                                    }
                                  }))}
                                  className="form-radio text-[#0b8043] focus:ring-[#0b8043]"
                                />
                                <span className="ml-2">Oui</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  checked={diagnosticInfo.leadPresence === false}
                                  onChange={() => setDiagnosticsInfo((prevInfo) => ({
                                    ...prevInfo,
                                    [diagnosticId]: {
                                      ...prevInfo[diagnosticId],
                                      type: diagnostic.id,
                                      leadPresence: false,
                                    }
                                  }))}
                                  className="form-radio text-[#0b8043] focus:ring-[#0b8043]"
                                />
                                <span className="ml-2">Non</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {diagnosticInfo.leadConcentration && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Concentration
                            </label>
                            <div className="mt-2 space-x-4">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  checked={diagnosticInfo.leadConcentration === 'above-threshold'}
                                  onChange={() => setDiagnosticsInfo((prevInfo) => ({
                                    ...prevInfo,
                                    [diagnosticId]: {
                                      ...prevInfo[diagnosticId],
                                      type: diagnostic.id,
                                      leadConcentration: 'above-threshold',
                                    }
                                  }))}
                                  className="form-radio text-[#0b8043] focus:ring-[#0b8043]"
                                />
                                <span className="ml-2">Supérieure aux seuils</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  checked={diagnosticInfo.leadConcentration === 'below-threshold'}
                                  onChange={() => setDiagnosticsInfo((prevInfo) => ({
                                    ...prevInfo,
                                    [diagnosticId]: {
                                      ...prevInfo[diagnosticId],
                                      type: diagnostic.id,
                                      leadConcentration: 'below-threshold',
                                    }
                                  }))}
                                  className="form-radio text-[#0b8043] focus:ring-[#0b8043]"
                                />
                                <span className="ml-2">Inférieure aux seuils</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowDiagnosticsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDiagnosticSave}
                  className="px-4 py-2 bg-[#0b8043] text-white rounded-md hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
